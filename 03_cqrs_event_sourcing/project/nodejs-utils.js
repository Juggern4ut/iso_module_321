const fs = require('fs');
const path = require('path');

/**
 * Read all objects from a JSONL file
 */
function readAll(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist.');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  return content
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => JSON.parse(line));
}

/**
 * Append a new object to a JSONL file
 */
function appendObject(filePath, obj) {
  const line = JSON.stringify(obj) + '\n';
  fs.appendFileSync(filePath, line, 'utf-8');
}

/**
 * Create a new file (empty or with optional initial content)
 */
function createFile(filePath, initialContent = '') {
  if (fs.existsSync(filePath)) {
    console.log('File already exists.');
    return;
  }

  fs.writeFileSync(filePath, initialContent, 'utf-8');
  console.log('File created:', filePath);
}

/**
 * Delete a file
 */
function deleteFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist.');
    return;
  }

  fs.unlinkSync(filePath);
  console.log('File deleted:', filePath);
}
