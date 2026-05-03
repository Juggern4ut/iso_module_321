// =============================================================================
// AUFGABE 2: Zustand berechnen (Event Sourcing / Projection)
// =============================================================================
// Der Kontozustand wird NIEMALS direkt gespeichert.
// Stattdessen wird er bei jeder Abfrage durch einen "Replay" aller Events
// von Grund auf neu berechnet (Fold über den Event-Stream).
// =============================================================================

// Startzustand eines Kontos, bevor irgendein Event angewendet wurde
function initialState() {
  return {
    accountId: null,
    owner: null,
    balance: 0,
    isOpen: false,
  };
}

// Aufgabe 2a: applyEvent
// Wendet ein einzelnes Event auf den aktuellen Zustand an und gibt den
// neuen Zustand zurück. Pure function: der Eingabe-Zustand wird nicht verändert.
function applyEvent(account, event) {
  switch (event.type) {
    case 'AccountOpened':
      return { ...account, accountId: event.accountId, owner: event.owner, isOpen: true };

    case 'MoneyDeposited':
      return { ...account, balance: account.balance + event.amount };

    case 'MoneyWithdrawn':
      return { ...account, balance: account.balance - event.amount };

    case 'AccountClosed':
      return { ...account, isOpen: false };

    // Zusatzaufgabe Überweisung: Sender verliert Geld
    case 'MoneyTransferred':
      return { ...account, balance: account.balance - event.amount };

    // Internes Event für den Empfänger einer Überweisung
    case 'MoneyReceived':
      return { ...account, balance: account.balance + event.amount };

    default:
      return account;
  }
}

// Aufgabe 2b: rebuildAccountFromEvents
// Rekonstruiert den vollständigen Kontozustand durch sequentiellen Replay
// aller Events, die dieses Konto betreffen (Event Sourcing).
function rebuildAccountFromEvents(events, accountId) {
  const relevantEvents = events.filter(
    e => e.accountId === accountId || e.toAccountId === accountId
  );

  return relevantEvents.reduce((state, event) => {
    // Bei einer Überweisung: Falls dieses Konto der Empfänger ist,
    // wird das MoneyTransferred-Event als MoneyReceived interpretiert.
    if (event.type === 'MoneyTransferred' && event.toAccountId === accountId) {
      return applyEvent(state, { ...event, type: 'MoneyReceived' });
    }
    return applyEvent(state, event);
  }, initialState());
}

module.exports = { initialState, applyEvent, rebuildAccountFromEvents };
