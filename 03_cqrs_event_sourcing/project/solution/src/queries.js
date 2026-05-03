// =============================================================================
// AUFGABE 4: Queries (Read-Seite von CQRS)
// =============================================================================
// Queries lesen Daten und verändern niemals den Systemzustand.
// Sie rekonstruieren die aktuellen Werte durch Event Replay aus dem Event Store.
//
// WICHTIG: Queries verändern keine Daten – sie sind reine Lesezugriffe.
// =============================================================================

const { readEvents } = require('./eventStore');
const { rebuildAccountFromEvents } = require('./account');

// Aufgabe 4a: getAccount – aktuellen Kontozustand abfragen
// Der Kontostand wird durch Replay aller Events berechnet, nicht direkt gelesen.
function getAccount(accountId) {
  const events = readEvents();
  const account = rebuildAccountFromEvents(events, accountId);

  if (!account.accountId) {
    throw new Error(`Konto ${accountId} nicht gefunden.`);
  }

  return account;
}

// Aufgabe 4b: getAllEvents – alle gespeicherten Events abfragen
// Gibt die vollständige, unveränderliche History aller Ereignisse zurück.
function getAllEvents() {
  return readEvents();
}

// =============================================================================
// ZUSATZAUFGABE: Mehrere Konten anzeigen
// =============================================================================
// Findet alle Konto-IDs aus dem Event Store und projiziert ihren aktuellen Zustand.
function getAllAccounts() {
  const events = readEvents();
  const accountIds = [...new Set(
    events.filter(e => e.accountId).map(e => e.accountId)
  )];
  return accountIds.map(id => rebuildAccountFromEvents(events, id));
}

module.exports = { getAccount, getAllEvents, getAllAccounts };
