#!/usr/bin/env node
// notes-rag Plugin Tool Test Runner
// Tests all 5 KB tools via plugin_dev_invoke_tool API
// Usage: node tests/run-tools-test.cjs
//
// This test uses the same invocation path as the agent engine,
// verifying end-to-end: plugin → CLI subprocess → SQLite → response

// NOTE: This test must be run via plugin_dev_invoke_tool or the Hanako API.
// It cannot be run standalone because the CLI requires Electron's file system access.
// Instead, we define the test cases as data that the agent can execute.

module.exports = {
  name: 'Notes RAG Tool Tests',
  version: '1.0.0',
  
  // Test cases: each has name, tool, input, and validation function
  tests: [
    // ═══ Health & Index Status ═══
    {
      group: 'Health & Index Status',
      name: 'kb_health returns valid structure',
      tool: 'notes-rag_kb_index_status',
      input: {},
      validate: (data) => {
        if (!['ok','indexing','degraded'].includes(data.status)) throw new Error('invalid status: ' + data.status);
        if (typeof data.docCount !== 'number') throw new Error('docCount not number');
        if (typeof data.chunkCount !== 'number') throw new Error('chunkCount not number');
        if (data.schemaVersion !== 1) throw new Error('schemaVersion not 1');
        return 'ok: status=' + data.status + ', docs=' + data.docCount + ', chunks=' + data.chunkCount;
      }
    },
    {
      group: 'Health & Index Status',
      name: 'Index has documents loaded',
      tool: 'notes-rag_kb_index_status',
      input: {},
      validate: (data) => {
        if (data.docCount <= 0) throw new Error('docCount=' + data.docCount + ' but expected >0');
        if (data.chunkCount <= 0) throw new Error('chunkCount=' + data.chunkCount + ' but expected >0');
        if (data.dbSizeBytes <= 0) throw new Error('dbSizeBytes=' + data.dbSizeBytes + ' but expected >0');
        return 'ok: ' + data.docCount + ' docs, ' + data.chunkCount + ' chunks, ' + Math.round(data.dbSizeBytes/1024/1024) + 'MB';
      }
    },

    // ═══ Search: Chinese ═══
    {
      group: 'Search - Chinese',
      name: '边缘云协同推理 (long Chinese query)',
      tool: 'notes-rag_kb_search',
      input: { query: '边缘云协同推理', limit: 5 },
      validate: (data) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('expected results, got ' + data.length);
        if (!data[0].chunkId) throw new Error('missing chunkId');
        if (!data[0].docId) throw new Error('missing docId');
        if (typeof data[0].score !== 'number') throw new Error('missing score');
        return 'ok: ' + data.length + ' results, top: "' + (data[0].title || '').slice(0, 30) + '"';
      }
    },
    {
      group: 'Search - Chinese',
      name: '扩散模型逆问题 (4-char Chinese)',
      tool: 'notes-rag_kb_search',
      input: { query: '扩散模型逆问题', limit: 3 },
      validate: (data) => {
        if (!Array.isArray(data)) throw new Error('expected array');
        return 'ok: ' + data.length + ' results';
      }
    },
    {
      group: 'Search - Chinese',
      name: '边缘云 (3-char Chinese, trigram minimum)',
      tool: 'notes-rag_kb_search',
      input: { query: '边缘云', limit: 5 },
      validate: (data) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('3-char should return results');
        return 'ok: ' + data.length + ' results';
      }
    },
    {
      group: 'Search - Chinese',
      name: '边缘 (2-char Chinese, below trigram minimum)',
      tool: 'notes-rag_kb_search',
      input: { query: '边缘', limit: 5 },
      validate: (data) => {
        if (!Array.isArray(data)) throw new Error('expected array');
        if (data.length !== 0) throw new Error('2-char should return empty, got ' + data.length);
        return 'ok: correctly empty (trigram needs 3+ chars)';
      }
    },

    // ═══ Search: English ═══
    {
      group: 'Search - English',
      name: 'hypergraph neural network (English technical)',
      tool: 'notes-rag_kb_search',
      input: { query: 'hypergraph neural network', limit: 3 },
      validate: (data) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('expected results');
        return 'ok: ' + data.length + ' results';
      }
    },
    {
      group: 'Search - English',
      name: 'research (English common word)',
      tool: 'notes-rag_kb_search',
      input: { query: 'research', limit: 5 },
      validate: (data) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('expected results');
        return 'ok: ' + data.length + ' results';
      }
    },
    {
      group: 'Search - English',
      name: 'limit parameter respected',
      tool: 'notes-rag_kb_search',
      input: { query: 'research', limit: 2 },
      validate: (data) => {
        if (data.length > 2) throw new Error('limit=2 but got ' + data.length);
        return 'ok: limit respected, got ' + data.length;
      }
    },
    {
      group: 'Search - Boundary',
      name: 'nonexistent query returns empty',
      tool: 'notes-rag_kb_search',
      input: { query: 'xyznonexistent123456789', limit: 5 },
      validate: (data) => {
        if (!Array.isArray(data) || data.length !== 0) throw new Error('expected empty');
        return 'ok: empty as expected';
      }
    },
    {
      group: 'Search - Boundary',
      name: 'missing query param returns empty array',
      tool: 'notes-rag_kb_search',
      input: {},
      validate: (data) => {
        if (!Array.isArray(data)) throw new Error('expected array');
        return 'ok: graceful empty';
      }
    },

    // ═══ Read Chunk ═══
    // NOTE: These depend on search returning a valid chunkId
    // They will be run in sequence, with the chunkId from search passed to read_chunk
    
    // ═══ Error Handling ═══
    {
      group: 'Error Handling',
      name: 'nonexistent chunkId returns null/empty',
      tool: 'notes-rag_kb_read_chunk',
      input: { chunkId: 'nonexistent_id_12345' },
      validate: (data) => {
        if (data !== null && !(Array.isArray(data) && data.length === 0)) {
          throw new Error('expected null or empty, got: ' + JSON.stringify(data).slice(0, 100));
        }
        return 'ok: null/empty as expected';
      }
    },
    {
      group: 'Error Handling',
      name: 'nonexistent docId returns null/empty',
      tool: 'notes-rag_kb_get_doc_meta',
      input: { docId: 'nonexistent_doc_id_12345' },
      validate: (data) => {
        if (data !== null && !(Array.isArray(data) && data.length === 0)) {
          throw new Error('expected null or empty, got: ' + JSON.stringify(data).slice(0, 100));
        }
        return 'ok: null/empty as expected';
      }
    },
  ]
};