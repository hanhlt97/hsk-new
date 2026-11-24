const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parse, validate } = require('../tools/import-vocab');

test('parses quoted CSV with commas', () => {
  const rows = parse('level,hanzi,pinyin,meaning,example\n1,你好,nǐ hǎo,"xin chào, bạn",你好！');
  assert.equal(rows[0].meaning, 'xin chào, bạn');
  assert.equal(validate(rows).clean.length, 1);
});

test('supports TSV and rejects duplicate/missing rows', () => {
  const rows = parse('level\thanzi\tpinyin\tmeaning\n1\t你好\tnǐ hǎo\txin chào\n1\t你好\tnǐ hǎo\txin chào\n10\t\t\n');
  const result = validate(rows);
  assert.equal(result.clean.length, 1);
  assert.equal(result.errors.length, 3);
});
