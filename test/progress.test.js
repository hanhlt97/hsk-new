const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function context() {
  const memory = new Map();
  const c = vm.createContext({
    document: { documentElement: { dataset: {} } },
    window: { addEventListener() {} },
    localStorage: { getItem: k => memory.get(k), setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) },
    console
  });
  for (const file of ['data', 'core', 'auth']) vm.runInContext(fs.readFileSync(`public/js/${file}.js`, 'utf8'), c);
  vm.runInContext('Store.load(); toast = () => {};', c);
  return c;
}

test('old data gets achievements and session defaults', () => {
  const c = context();
  assert.equal(vm.runInContext('Store.d.sessions.length', c), 0);
  assert.equal(vm.runInContext('Object.keys(Store.d.achievements).length', c), 0);
});

test('achievement unlock is persistent and not awarded twice', () => {
  const c = context();
  vm.runInContext('Store.record(WORDS[0].id, true); this.first = Store.d.achievements.first; Store.record(WORDS[0].id, true);', c);
  assert.equal(vm.runInContext('Store.d.achievements.first === first', c), true);
  assert.equal(vm.runInContext('Store.d.prog[WORDS[0].id].ok', c), 2);
});

test('session history is limited and survives reload', () => {
  const c = context();
  vm.runInContext('for (let i=0;i<40;i++) Store.session("practice", 8, 10, 60); Store.load();', c);
  assert.equal(vm.runInContext('Store.d.sessions.length', c), 30);
});

test('merge retains achievements and deduplicates sessions', () => {
  const c = context();
  vm.runInContext('Store.session("practice", 8, 10, 60); Store.record(WORDS[0].id, true); this.merged = Auth.merge(Store.d, Store.d);', c);
  assert.equal(vm.runInContext('merged.sessions.length', c), 1);
  assert.equal(vm.runInContext('Boolean(merged.achievements.first)', c), true);
});
