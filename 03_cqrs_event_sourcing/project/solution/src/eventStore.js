// =============================================================================
// AUFGABE 1: Event Store
// =============================================================================
// Der Event Store ist der einzige persistente Speicher im System.
// Er speichert Events im JSONL-Format (JSON Lines): jede Zeile ist ein Event.
// Der Kontostand wird hier NIEMALS gespeichert – nur Ereignisse.
// =============================================================================

const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, '../data/events.jsonl');

function ensureDataDir() {
  const dir = path.dirname(EVENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Aufgabe 1a: appendEvent
// Hängt ein neues Event als JSON-Zeile an die JSONL-Datei an.
// Append-only: Events werden nie überschrieben oder gelöscht.
function appendEvent(event) {
  ensureDataDir();
  const line = JSON.stringify(event) + '\n';
  fs.appendFileSync(EVENTS_FILE, line, 'utf8');
}

// Aufgabe 1b: readEvents
// Liest alle gespeicherten Events aus der Datei und gibt sie als Array zurück.
// Jede nicht-leere Zeile wird als JSON geparst.
function readEvents() {
  ensureDataDir();
  if (!fs.existsSync(EVENTS_FILE)) {
    return [];
  }
  const content = fs.readFileSync(EVENTS_FILE, 'utf8');
  return content
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
}

module.exports = { appendEvent, readEvents };
