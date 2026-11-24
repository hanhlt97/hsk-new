const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync('public/js/work.js', 'utf8') + ';this.departments = WORK; this.words = WORK_WORDS;', context);

test('workplace departments have complete vocabulary and phrases', () => {
  assert.equal(Object.keys(context.departments).length, 11);
  for (const department of Object.values(context.departments)) {
    assert.ok(department.words.length >= 15);
    assert.ok(department.phrases.length >= 3);
    assert.equal(new Set(department.words.map(row => row[0])).size, department.words.length);
    for (const row of [...department.words, ...department.phrases]) {
      assert.equal(row.length, 3);
      assert.ok(row.every(value => typeof value === 'string' && value.trim().length > 0));
    }
  }
});

test('workplace progress IDs are unique and independent of HSK', () => {
  assert.equal(new Set(context.words.map(word => word.id)).size, context.words.length);
  assert.ok(context.words.every(word => word.id.startsWith('work:')));
  console.log(`${context.words.length} vocabulary entries across 11 departments`);
});
