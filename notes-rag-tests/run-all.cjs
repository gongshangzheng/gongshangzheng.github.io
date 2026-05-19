#!/usr/bin/env node
// notes-rag-core CLI test runner
// Runs all tests via CLI subprocess IPC (same mechanism as plugin)
// Usage: HOME=/Users/zhengxinyu node tests/run-all.cjs

const { spawn } = require('child_process');
const { resolve } = require('path');
const { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } = require('fs');

const HANAKO_NODE = '/Applications/Hanako.app/Contents/Resources/server/node';
const CLI_PATH = resolve(process.env.HOME, 'notes-rag-core/cli.cjs');
const TMP = resolve('/tmp', 'notes-rag-tests-tmp');
mkdirSync(TMP, { recursive: true });

let passed = 0, failed = 0;
const failures = [];

function assert(cond, msg) { if (!cond) throw new Error('Assert: ' + msg); }

function cliCall(method, args = {}, timeout = 15000) {
  return new Promise((resCb, rejCb) => {
    const callId = Date.now() + '_' + Math.random().toString(36).slice(2);
    const reqFile = resolve(TMP, 'test_req_' + callId + '.json');
    const resFile = resolve(TMP, 'test_res_' + callId + '.json');
    writeFileSync(reqFile, JSON.stringify({ method, args }));
    const child = spawn(HANAKO_NODE, [CLI_PATH], {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: resolve(process.env.HOME, 'notes-rag-core'),
      env: { HOME: process.env.HOME, TMPDIR: TMP, RAG_REQUEST_FILE: reqFile, RAG_RESPONSE_FILE: resFile }
    });
    const timer = setTimeout(() => { child.kill(); cleanup(); rejCb(new Error('TIMEOUT')); }, timeout);
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0 && existsSync(resFile)) {
        try {
          const resp = JSON.parse(readFileSync(resFile, 'utf-8'));
          cleanup();
          resp.ok ? resCb(resp.data) : rejCb(new Error(resp.error || 'CLI_ERROR'));
        } catch (e) { cleanup(); rejCb(new Error('PARSE: ' + e.message)); }
      } else { cleanup(); rejCb(new Error('EXIT_' + code)); }
    });
    child.on('error', (e) => { clearTimeout(timer); cleanup(); rejCb(new Error('SPAWN: ' + e.message)); });
    function cleanup() { try { unlinkSync(reqFile); } catch {} try { unlinkSync(resFile); } catch {} }
  });
}

async function test(name, fn) {
  try { await fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) { failed++; failures.push({ name, error: e.message }); console.log('  ❌ ' + name + ': ' + e.message); }
}

async function runAll() {
  console.log('\n🧪 Notes RAG CLI Test Suite\n');
  const t0 = Date.now();

  // ═══ Health & Index Status ═══
  console.log('📦 Health & Index Status');
  await test('kb_health returns valid structure', async () => {
    const d = await cliCall('kb_health');
    assert(['ok','indexing','degraded'].includes(d.status), 'status valid');
    assert(typeof d.docCount === 'number', 'docCount is number');
    assert(typeof d.chunkCount === 'number', 'chunkCount is number');
    assert(typeof d.dbSizeBytes === 'number', 'dbSizeBytes is number');
    assert(d.schemaVersion === 1, 'schema version is 1');
  });
  await test('kb_index_status matches kb_health', async () => {
    const h = await cliCall('kb_health');
    const s = await cliCall('kb_index_status');
    assert(h.docCount === s.docCount, 'docCount matches');
    assert(h.chunkCount === s.chunkCount, 'chunkCount matches');
  });
  await test('Index has documents loaded', async () => {
    const d = await cliCall('kb_health');
    assert(d.docCount > 0, 'docCount > 0, got ' + d.docCount);
    assert(d.chunkCount > 0, 'chunkCount > 0, got ' + d.chunkCount);
  });

  // ═══ Search ═══
  console.log('\n🔍 Search');
  await test('Chinese long query (边缘云协同推理) returns results', async () => {
    const r = await cliCall('kb_search', { query: '边缘云协同推理', limit: 5 });
    assert(Array.isArray(r) && r.length > 0, 'has results');
    assert(r[0].chunkId, 'has chunkId');
    assert(r[0].docId, 'has docId');
    assert(typeof r[0].score === 'number', 'has score');
    assert(typeof r[0].snippet === 'string', 'has snippet');
  });
  await test('Chinese 4-char query (扩散模型逆问题)', async () => {
    const r = await cliCall('kb_search', { query: '扩散模型逆问题', limit: 3 });
    assert(Array.isArray(r), 'returns array');
  });
  await test('Chinese 5-char query (视觉Tokenizer)', async () => {
    const r = await cliCall('kb_search', { query: '视觉Tokenizer研究', limit: 3 });
    assert(Array.isArray(r), 'returns array');
  });
  await test('English technical query (hypergraph neural network)', async () => {
    const r = await cliCall('kb_search', { query: 'hypergraph neural network', limit: 3 });
    assert(Array.isArray(r) && r.length > 0, 'has results');
  });
  await test('English common word (research)', async () => {
    const r = await cliCall('kb_search', { query: 'research', limit: 5 });
    assert(r.length > 0, 'has results');
  });
  await test('Search respects limit parameter', async () => {
    const r = await cliCall('kb_search', { query: 'research', limit: 2 });
    assert(r.length <= 2, 'limit respected, got ' + r.length);
  });
  await test('Nonexistent query returns empty array', async () => {
    const r = await cliCall('kb_search', { query: 'xyznonexistent123456789', limit: 5 });
    assert(Array.isArray(r) && r.length === 0, 'empty');
  });

  // ═══ Read Chunk ═══
  let chunkId, docId;
  console.log('\n📄 Read Chunk');
  await test('Read valid chunk by chunkId', async () => {
    const s = await cliCall('kb_search', { query: '边缘云协同推理', limit: 1 });
    assert(s.length > 0, 'search found results');
    chunkId = s[0].chunkId;
    docId = s[0].docId;
    const c = await cliCall('kb_read_chunk', { chunkId });
    assert(c && c.chunkId === chunkId, 'chunkId matches');
    assert(typeof c.content === 'string', 'content is string');
    assert(typeof c.charCount === 'number', 'charCount is number');
    assert(typeof c.headingPath === 'string', 'headingPath is string');
  });
  await test('Read nonexistent chunk returns null', async () => {
    const c = await cliCall('kb_read_chunk', { chunkId: 'nonexistent_id_12345' });
    assert(c === null, 'returns null');
  });

  // ═══ Doc Meta ═══
  console.log('\n📋 Document Metadata');
  await test('Get valid doc meta by docId', async () => {
    assert(docId, 'have valid docId');
    const m = await cliCall('kb_get_doc_meta', { docId });
    assert(m && m.docId === docId, 'docId matches');
    assert(typeof m.title === 'string', 'title is string');
    assert(m.chunkCount > 0, 'has chunks');
  });
  await test('Get nonexistent doc returns null', async () => {
    const m = await cliCall('kb_get_doc_meta', { docId: 'nonexistent_doc_id_12345' });
    assert(m === null, 'returns null');
  });

  // ═══ Links ═══
  console.log('\n🔗 Links');
  await test('List outgoing links for doc', async () => {
    assert(docId, 'have valid docId');
    const l = await cliCall('kb_list_links', { docId, direction: 'out' });
    assert(Array.isArray(l), 'returns array');
  });
  await test('Unsupported direction (in) returns error', async () => {
    const l = await cliCall('kb_list_links', { docId, direction: 'in' });
    assert(l.error === 'UNSUPPORTED_DIRECTION', 'error code');
  });

  // ═══ Error Handling ═══
  console.log('\n🛡️ Error Handling');
  await test('Unknown method returns sanitized error', async () => {
    try {
      await cliCall('unknown_method_xyz');
      assert(false, 'should have thrown');
    } catch (e) {
      assert(
        e.message.includes('UNKNOWN_METHOD') || e.message.includes('EXECUTION_ERROR'),
        'error code sanitized, got: ' + e.message
      );
    }
  });
  await test('Missing required params handled gracefully', async () => {
    const r = await cliCall('kb_search', {});
    assert(Array.isArray(r), 'returns array even without query');
  });

  // ═══ Trigram Tokenizer ═══
  console.log('\n🔤 Trigram Tokenizer Limitations');
  await test('2-char Chinese (边缘) returns empty — trigram needs 3+', async () => {
    const r = await cliCall('kb_search', { query: '边缘', limit: 5 });
    assert(Array.isArray(r) && r.length === 0, '2-char returns empty');
  });
  await test('3-char Chinese (边缘云) returns results', async () => {
    const r = await cliCall('kb_search', { query: '边缘云', limit: 5 });
    assert(Array.isArray(r) && r.length > 0, '3-char has results');
  });

  // ═══ Summary ═══
  const dur = Date.now() - t0;
  console.log('\n' + '─'.repeat(50));
  console.log('📊 Results: ' + passed + ' passed, ' + failed + ' failed (' + dur + 'ms)');
  if (failures.length) {
    console.log('\n❌ Failures:');
    failures.forEach(f => console.log('  - ' + f.name + ': ' + f.error));
  }
  console.log('');
  try { require('fs').rmSync(TMP, { recursive: true }); } catch {}
  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(e => { console.error('Fatal:', e); process.exit(2); });
