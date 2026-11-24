#!/usr/bin/env node
// Import vocabulary CSV/TSV into data/vocab.json.
// Columns: level,hanzi,pinyin,meaning,example,exampleMeaning,tags
const fs = require('node:fs');
const path = require('node:path');

function parseLine(line, delimiter) {
  const out = []; let value = ''; let quote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && line[i + 1] === '"') { value += '"'; i++; continue; }
    if (c === '"') { quote = !quote; continue; }
    if (c === delimiter && !quote) { out.push(value.trim()); value = ''; } else value += c;
  }
  out.push(value.trim()); return out;
}
function parse(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
  if (!lines.length) return [];
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseLine(lines.shift(), delimiter).map(x => x.toLowerCase().replace(/\s+/g, ''));
  const aliases = { hsk: 'level', hanzi: 'hanzi', chinese: 'hanzi', pinyin: 'pinyin', meaning: 'meaning', vietnamese: 'meaning', example: 'example', examplemeaning: 'exampleMeaning', tags: 'tags' };
  return lines.map((line, n) => {
    const values = parseLine(line, delimiter), row = {};
    headers.forEach((h, i) => { const key = aliases[h] || h; row[key] = values[i] || ''; });
    row.line = n + 2; return row;
  });
}
function validate(rows) {
  const errors = [], seen = new Set(), clean = [];
  rows.forEach(row => {
    const level = Number(row.level), hanzi = String(row.hanzi || '').trim(), pinyin = String(row.pinyin || '').trim(), meaning = String(row.meaning || '').trim();
    if (!Number.isInteger(level) || level < 1 || level > 9) errors.push(`Dòng ${row.line}: level phải là số nguyên 1–9`);
    if (!hanzi || !pinyin || !meaning) errors.push(`Dòng ${row.line}: cần có hanzi, pinyin, meaning`);
    const id = `${level}:${hanzi}`;
    const duplicate = seen.has(id);
    if (duplicate) errors.push(`Dòng ${row.line}: trùng ${id}`); else seen.add(id);
    if (!duplicate && hanzi && pinyin && meaning && Number.isInteger(level) && level >= 1 && level <= 9) {
      clean.push({ id, level, hanzi, pinyin, meaning, example: String(row.example || '').trim(), exampleMeaning: String(row.exampleMeaning || '').trim(), tags: String(row.tags || '').split(/[|;]/).map(x => x.trim()).filter(Boolean) });
    }
  });
  return { clean, errors };
}
function main() {
  const input = process.argv[2];
  if (!input) { console.error('Dùng: node tools/import-vocab.js data/input.csv'); process.exit(2); }
  const result = validate(parse(fs.readFileSync(input, 'utf8')));
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exit(1); }
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/vocab.json', JSON.stringify({ schema: 1, source: path.basename(input), importedAt: new Date().toISOString(), words: result.clean }, null, 2) + '\n');
  console.log(`Đã nhập ${result.clean.length} từ vào data/vocab.json`);
}
if (require.main === module) main();
module.exports = { parse, validate };
