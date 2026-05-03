// =============================================================================
// AUFGABE 3: Commands (Write-Seite von CQRS)
// =============================================================================
// Commands beschreiben eine Absicht, etwas zu verändern (Imperativ: "tue X").
// Sie prüfen Geschäftsregeln (Validierung) und erzeugen bei Erfolg Events.
//
// WICHTIG: Commands verändern niemals direkt den Zustand!
//          Sie erzeugen ausschliesslich Events, die im Event Store gespeichert werden.
// =============================================================================

const { appendEvent, readEvents } = require('./eventStore');
const { rebuildAccountFromEvents } = require('./account');

// Aufgabe 3a: openAccount – Konto eröffnen
function openAccount(accountId, owner) {
  const events = readEvents();
  const existing = rebuildAccountFromEvents(events, accountId);

  // Geschäftsregel: Konto-ID darf nicht bereits vergeben sein
  if (existing.isOpen) {
    throw new Error(`Konto ${accountId} existiert bereits.`);
  }

  appendEvent({
    type: 'AccountOpened',
    accountId,
    owner,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Command] Konto ${accountId} für "${owner}" eröffnet.`);
}

// Aufgabe 3b: depositMoney – Geld einzahlen
function depositMoney(accountId, amount) {
  const events = readEvents();
  const account = rebuildAccountFromEvents(events, accountId);

  // Geschäftsregeln
  if (!account.isOpen) throw new Error(`Konto ${accountId} ist nicht offen.`);
  if (amount <= 0) throw new Error('Einzahlungsbetrag muss grösser als 0 sein.');

  appendEvent({
    type: 'MoneyDeposited',
    accountId,
    amount,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Command] CHF ${amount} auf Konto ${accountId} eingezahlt.`);
}

// Aufgabe 3c: withdrawMoney – Geld abheben
function withdrawMoney(accountId, amount) {
  const events = readEvents();
  const account = rebuildAccountFromEvents(events, accountId);

  // Geschäftsregeln
  if (!account.isOpen) throw new Error(`Konto ${accountId} ist nicht offen.`);
  if (amount <= 0) throw new Error('Abhebebetrag muss grösser als 0 sein.');
  if (account.balance < amount) {
    throw new Error(`Ungenügendes Guthaben. Verfügbar: CHF ${account.balance}`);
  }

  appendEvent({
    type: 'MoneyWithdrawn',
    accountId,
    amount,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Command] CHF ${amount} von Konto ${accountId} abgehoben.`);
}

// Aufgabe 3d: closeAccount – Konto schliessen
function closeAccount(accountId) {
  const events = readEvents();
  const account = rebuildAccountFromEvents(events, accountId);

  if (!account.isOpen) throw new Error(`Konto ${accountId} ist bereits geschlossen.`);

  appendEvent({
    type: 'AccountClosed',
    accountId,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Command] Konto ${accountId} geschlossen.`);
}

// =============================================================================
// ZUSATZAUFGABE: transferMoney – Überweisung zwischen zwei Konten
// =============================================================================
// Ein einziges Event referenziert beide Konten (Sender und Empfänger).
// Bei der Projektion wird dasselbe Event unterschiedlich interpretiert:
//   - Für den Sender: Betrag wird abgezogen
//   - Für den Empfänger: Betrag wird gutgeschrieben
function transferMoney(fromAccountId, toAccountId, amount) {
  const events = readEvents();
  const sender = rebuildAccountFromEvents(events, fromAccountId);
  const receiver = rebuildAccountFromEvents(events, toAccountId);

  if (!sender.isOpen) throw new Error(`Senderkonto ${fromAccountId} ist nicht offen.`);
  if (!receiver.isOpen) throw new Error(`Empfängerkonto ${toAccountId} ist nicht offen.`);
  if (amount <= 0) throw new Error('Überweisungsbetrag muss grösser als 0 sein.');
  if (sender.balance < amount) {
    throw new Error(`Ungenügendes Guthaben. Verfügbar: CHF ${sender.balance}`);
  }

  appendEvent({
    type: 'MoneyTransferred',
    accountId: fromAccountId,
    toAccountId,
    amount,
    timestamp: new Date().toISOString(),
  });

  console.log(`[Command] CHF ${amount} von ${fromAccountId} an ${toAccountId} überwiesen.`);
}

module.exports = { openAccount, depositMoney, withdrawMoney, closeAccount, transferMoney };
