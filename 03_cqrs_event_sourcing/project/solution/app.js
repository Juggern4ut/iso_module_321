// =============================================================================
// AUFGABE 5: Testprogramm
// =============================================================================
// Demonstriert alle Konzepte: Event Store, Commands, Queries, Read Model.
// Führe aus mit: node app.js
// =============================================================================

const fs = require('fs');
const path = require('path');
const { openAccount, depositMoney, withdrawMoney, closeAccount, transferMoney } = require('./src/commands');
const { getAccount, getAllEvents, getAllAccounts } = require('./src/queries');
const { updateReadModel, getReadModel } = require('./src/readModel');

// Für saubere Demo: bestehende Events löschen
const eventsFile = path.join(__dirname, 'data/events.jsonl');
const readModelFile = path.join(__dirname, 'data/accounts_read_model.json');
if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);
if (fs.existsSync(readModelFile)) fs.unlinkSync(readModelFile);

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║     CQRS + Event Sourcing: Bankkonto-Demo            ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// ─────────────────────────────────────────────────────────────────────────────
// AUFGABE 3 + 5: Commands ausführen (Write-Seite)
// Jeder Command erzeugt ein Event – der Zustand wird nie direkt gespeichert.
// ─────────────────────────────────────────────────────────────────────────────
console.log('━━━ Commands (Write-Seite) ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

openAccount('A-100', 'Mia');
depositMoney('A-100', 200);
withdrawMoney('A-100', 50);

// ZUSATZAUFGABE: Mehrere Konten
openAccount('A-200', 'Noah');
depositMoney('A-200', 500);
depositMoney('A-200', 100);

// ZUSATZAUFGABE: Überweisung
transferMoney('A-200', 'A-100', 100);

// ─────────────────────────────────────────────────────────────────────────────
// AUFGABE 4 + 5: Queries ausführen (Read-Seite)
// Der Kontostand wird durch Event Replay berechnet, nicht direkt gelesen.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Queries (Read-Seite) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const mia = getAccount('A-100');
console.log('Konto A-100 (Mia):');
console.log(`  Inhaber: ${mia.owner}  |  Kontostand: CHF ${mia.balance}  |  Status: ${mia.isOpen ? 'offen' : 'geschlossen'}`);

const noah = getAccount('A-200');
console.log('\nKonto A-200 (Noah):');
console.log(`  Inhaber: ${noah.owner}  |  Kontostand: CHF ${noah.balance}  |  Status: ${noah.isOpen ? 'offen' : 'geschlossen'}`);

// ─────────────────────────────────────────────────────────────────────────────
// AUFGABE 2 (Beobachtung): Alle Events anzeigen
// Zeigt den vollständigen Event-Stream – die einzige "source of truth".
// Der Kontostand erscheint hier nirgends direkt!
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Alle gespeicherten Events (Event Store) ━━━━━━━━━━━\n');
const allEvents = getAllEvents();
allEvents.forEach((e, i) => {
  console.log(`  ${String(i + 1).padStart(2, '0')}. ${JSON.stringify(e)}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// ERWEITERUNG: Read Model aufbauen und anzeigen
// Das Read Model wird aus Events projiziert und in einer JSON-Datei gespeichert.
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Read Model (Projektion aller Konten) ━━━━━━━━━━━━━\n');
updateReadModel();
const readModel = getReadModel();
console.log('Inhalt von accounts_read_model.json:');
readModel.forEach(a => {
  console.log(`  ${a.accountId} (${a.owner}): CHF ${a.balance} [${a.isOpen ? 'offen' : 'geschlossen'}]`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Fehlerbehandlung demonstrieren
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n━━━ Fehlerbehandlung (ungültige Commands) ━━━━━━━━━━━━\n');

try {
  withdrawMoney('A-100', 99999);  // Fehlschlag: ungenügendes Guthaben
} catch (e) {
  console.log(`[Fehler abgefangen] ${e.message}`);
}

try {
  openAccount('A-100', 'Mia');   // Fehlschlag: Konto bereits offen
} catch (e) {
  console.log(`[Fehler abgefangen] ${e.message}`);
}

try {
  depositMoney('A-999', 50);     // Fehlschlag: Konto existiert nicht
} catch (e) {
  console.log(`[Fehler abgefangen] ${e.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Konto schliessen (Aufgabe 3d)
// ─────────────────────────────────────────────────────────────────────────────
console.log('');
closeAccount('A-100');
console.log('Konto A-100 nach Schliessung:', getAccount('A-100'));

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║              Demo abgeschlossen                      ║');
console.log('╚══════════════════════════════════════════════════════╝');
