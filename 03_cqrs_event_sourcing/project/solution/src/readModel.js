// =============================================================================
// ERWEITERUNG: Read Model (Projektion / Materialized View)
// =============================================================================
// Das Read Model ist eine vorberechnete, optimierte Darstellung der Daten.
// Es darf Kontostände speichern – wird aber IMMER aus Events berechnet.
//
// Kernprinzip: Das Read Model kann jederzeit gelöscht und aus dem Event Store
// vollständig wiederhergestellt werden. Es ist kein primärer Datenspeicher.
//
// Diese Datei demonstriert auch "Eventual Consistency":
// Das Read Model ist möglicherweise kurz veraltet, bis die Projektion läuft.
// =============================================================================

const fs = require('fs');
const path = require('path');
const { readEvents } = require('./eventStore');
const { rebuildAccountFromEvents } = require('./account');

const READ_MODEL_FILE = path.join(__dirname, '../data/accounts_read_model.json');

// updateReadModel – erstellt das Read Model neu aus allen Events (Projektion)
// Muss nach jedem Command aufgerufen werden, um das Read Model aktuell zu halten.
function updateReadModel() {
  const events = readEvents();
  const accountIds = [...new Set(
    events.filter(e => e.accountId).map(e => e.accountId)
  )];
  const accounts = accountIds.map(id => rebuildAccountFromEvents(events, id));

  fs.writeFileSync(READ_MODEL_FILE, JSON.stringify(accounts, null, 2), 'utf8');
  console.log('[ReadModel] Projektion abgeschlossen – Read Model aktualisiert.');
  return accounts;
}

// getReadModel – liest das bestehende Read Model aus der Datei
// Schnell: kein Event Replay, direkte Leseoperation.
function getReadModel() {
  if (!fs.existsSync(READ_MODEL_FILE)) {
    // Read Model noch nicht vorhanden → aus Events aufbauen
    return updateReadModel();
  }
  const content = fs.readFileSync(READ_MODEL_FILE, 'utf8');
  return JSON.parse(content);
}

module.exports = { updateReadModel, getReadModel };
