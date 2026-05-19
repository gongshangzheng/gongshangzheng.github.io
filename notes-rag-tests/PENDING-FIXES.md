--- cli.cjs fix for doListLinks ---
Replace the doListLinks function in ~/notes-rag-core/cli.cjs with:

  function doListLinks(docId, direction) {
    if (direction === 'in') return { error: 'UNSUPPORTED_DIRECTION' };
    try {
      const rows = db.prepare(`
        SELECT DISTINCT c.doc_id as docId, d.title, ch.heading_path as headingPath
        FROM chunks ch, json_each(ch.links_out) l
        JOIN documents c ON c.doc_id = l.value
        JOIN documents d ON d.doc_id = c.doc_id
        WHERE ch.doc_id = ? AND ch.links_out IS NOT NULL AND ch.links_out != '[]'
      `).all(docId);
      return rows;
    } catch {
      return [];
    }
  }

--- plugin index.js fix for exit handler ---
In ~/notes-rag-plugin/index.js, replace the child.on('exit') handler.
Change the first line from:
  if (code === 0 && existsSync(resFile)) {
To:
  if (existsSync(resFile)) {

This allows the plugin to read the CLI's error response even when exit code is 1.
The CLI writes error responses to the file before calling process.exit(1).
