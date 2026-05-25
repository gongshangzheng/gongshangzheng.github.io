function buildPlotAssets(page) {
  const needsFunctionPlot = page.indexOf('data-functionplot') >= 0;
  const needsJsxGraph = page.indexOf('data-jsxgraph') >= 0;
  if (!needsFunctionPlot && !needsJsxGraph) return '';

  const tags = ['<link rel="stylesheet" href="assets/css/plots.css">'];
  if (needsFunctionPlot) tags.push('<script src="assets/js/functionplot-runtime.js" defer></script>');
  if (needsJsxGraph) tags.push('<script src="assets/js/jsxgraph-runtime.js" defer></script>');
  return tags.join('\n') + '\n';
}

function injectPlotAssets(page) {
  const assets = buildPlotAssets(page);
  if (!assets) return page;
  const headEndIdx = page.indexOf('</head>');
  if (headEndIdx < 0) return page;
  return page.slice(0, headEndIdx) + assets + page.slice(headEndIdx);
}

module.exports = {
  buildPlotAssets,
  injectPlotAssets,
};
