const assert = require('assert');
const { buildPlotAssets, injectPlotAssets } = require('../lib/plot-assets');

const tests = {
  'plot assets: no plot marker emits no assets': () => {
    const out = buildPlotAssets('<html><head></head><body>plain</body></html>');
    assert.equal(out, '');
  },

  'plot assets: functionplot marker emits only functionplot runtime plus shared css': () => {
    const out = buildPlotAssets('<div data-functionplot></div>');
    assert(out.includes('assets/css/plots.css'));
    assert(out.includes('assets/js/functionplot-runtime.js'));
    assert(!out.includes('jsxgraph-runtime.js'));
  },

  'plot assets: jsxgraph marker emits only jsxgraph runtime plus shared css': () => {
    const out = buildPlotAssets('<div data-jsxgraph></div>');
    assert(out.includes('assets/css/plots.css'));
    assert(out.includes('assets/js/jsxgraph-runtime.js'));
    assert(!out.includes('functionplot-runtime.js'));
  },

  'plot assets: both markers emit both runtimes once': () => {
    const out = buildPlotAssets('<div data-functionplot></div><div data-jsxgraph></div>');
    assert.equal((out.match(/plots\.css/g) || []).length, 1);
    assert.equal((out.match(/functionplot-runtime\.js/g) || []).length, 1);
    assert.equal((out.match(/jsxgraph-runtime\.js/g) || []).length, 1);
  },

  'plot assets: injectPlotAssets inserts links before head close': () => {
    const out = injectPlotAssets('<html><head><title>x</title></head><body><div data-functionplot></div></body></html>');
    assert(out.indexOf('assets/css/plots.css') < out.indexOf('</head>'));
  },
};

module.exports = { tests, name: 'plot-assets' };
