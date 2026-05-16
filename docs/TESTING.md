# Testing Guide

## Running Tests

```bash
node tests/run.js
```

## Options

```bash
node tests/run.js --docs   # Generate docs/test-results.md
node tests/run.js --watch  # Rerun on file change (requires chokidar or fs.watch)
```

## Writing Tests

Add a new test file at `tests/<module>.test.js`:

```js
const assert = require('assert');
const { myFunc } = require('../lib/mymodule');

const tests = {
  'myFunc: basic case': () => {
    assert.equal(myFunc('input'), 'expected');
  },
  'myFunc: edge case': () => {
    assert.throws(() => myFunc(null), TypeError);
  },
};

module.exports = { tests, name: 'mymodule' };
```

## Test Categories

| File | Tests |
|------|-------|
| generator | 21 |
| parser | 22 |
| toc | 18 |

## Coverage

**Total:** 61 tests across 3 modules.

See `docs/coverage.md` for per-module breakdown.
