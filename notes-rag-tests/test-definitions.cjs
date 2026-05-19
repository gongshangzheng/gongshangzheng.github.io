#!/usr/bin/env node
// Notes RAG - Automated test runner via plugin_dev_invoke_tool
// This file defines test cases. Hanako (the agent) runs them via plugin_dev_invoke_tool.
// Run: Have Hanako execute all tests defined below.

const TEST_CASES = [
  // Group 1: Health
  { g: 'Health', n: 'kb_index_status valid structure', t: 'notes-rag_kb_index_status', i: {},
    v: d => ['ok','indexing','degraded'].includes(d.status) && typeof d.docCount==='number' && d.schemaVersion===1 },
  { g: 'Health', n: 'Index has data', t: 'notes-rag_kb_index_status', i: {},
    v: d => d.docCount > 0 && d.chunkCount > 0 && d.dbSizeBytes > 0 },

  // Group 2: Chinese Search
  { g: 'Search-CN', n: '边缘云协同推理 (long)', t: 'notes-rag_kb_search', i: { query: '边缘云协同推理', limit: 5 },
    v: d => Array.isArray(d) && d.length > 0 && d[0].chunkId && typeof d[0].score === 'number' },
  { g: 'Search-CN', n: '边缘云 (3-char min)', t: 'notes-rag_kb_search', i: { query: '边缘云', limit: 5 },
    v: d => Array.isArray(d) && d.length > 0 },
  { g: 'Search-CN', n: '边缘 (2-char empty)', t: 'notes-rag_kb_search', i: { query: '边缘', limit: 5 },
    v: d => Array.isArray(d) && d.length === 0 },
  { g: 'Search-CN', n: '扩散模型逆问题', t: 'notes-rag_kb_search', i: { query: '扩散模型逆问题', limit: 3 },
    v: d => Array.isArray(d) },

  // Group 3: English Search
  { g: 'Search-EN', n: 'hypergraph neural network', t: 'notes-rag_kb_search', i: { query: 'hypergraph neural network', limit: 3 },
    v: d => Array.isArray(d) && d.length > 0 },
  { g: 'Search-EN', n: 'research (common)', t: 'notes-rag_kb_search', i: { query: 'research', limit: 2 },
    v: d => Array.isArray(d) && d.length > 0 && d.length <= 2 },
  { g: 'Search-EN', n: 'nonexistent returns empty', t: 'notes-rag_kb_search', i: { query: 'xyznonexistent123456789', limit: 5 },
    v: d => Array.isArray(d) && d.length === 0 },

  // Group 4: Error handling
  { g: 'Errors', n: 'nonexistent chunkId', t: 'notes-rag_kb_read_chunk', i: { chunkId: 'nonexistent_12345' },
    v: d => d === null },
  { g: 'Errors', n: 'nonexistent docId', t: 'notes-rag_kb_get_doc_meta', i: { docId: 'nonexistent_12345' },
    v: d => d === null },
];

// Print test plan
console.log('Test plan: ' + TEST_CASES.length + ' tests defined');
TEST_CASES.forEach((t, i) => console.log('  ' + (i+1) + '. [' + t.g + '] ' + t.n));
module.exports = TEST_CASES;
