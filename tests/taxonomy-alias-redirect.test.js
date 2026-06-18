const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildTaxonomyPages } = require('../lib/generator');
const { createTaxonomyResolver } = require('../lib/taxonomy');

const tests = {
  'buildTaxonomyPages: category/subcategory alias taxonomy path writes hub html directly': () => {
    const root = '/tmp/taxonomy-alias-' + Date.now();
    fs.mkdirSync(root + '/templates', { recursive: true });
    fs.mkdirSync(root + '/public', { recursive: true });
    fs.writeFileSync(path.join(root, 'templates', '_base.html'), '<html><head></head><body><!-- INJECT content --></body></html>');
    fs.writeFileSync(path.join(root, 'templates', '_header.html'), '');
    fs.writeFileSync(path.join(root, 'templates', '_footer.html'), '');
    fs.writeFileSync(path.join(root, 'public', 'kuo-san-mo-xing-gai-shu.html'), '<html><body><h1>数字信号处理｜课程笔记中枢页</h1></body></html>');

    const paths = {
      templates: path.join(root, 'templates'),
      public: path.join(root, 'public')
    };
    const buildContext = (page = {}) => ({ base_url: '/', title: 't', description: 'd', ...page });
    const taxonomy = createTaxonomyResolver({ version: 1, tags: { '信号处理': 'xin-hao-chu-li' }, categories: { '人工智能': 'ren-gong-zhi-neng', '课程': 'ke-cheng' }, subcategories: { '人工智能': { '基础': 'ji-chu' }, '课程': { '数字信号处理': 'shu-zi-xin-hao-chu-li' } } });
    const posts = [{
      title: '扩散模型概述',
      slug: 'kuo-san-mo-xing-gai-shu',
      url: './kuo-san-mo-xing-gai-shu.html',
      tags: ['信号处理'],
      categories: ['课程'],
      subcategory: '数字信号处理',
      aliases: ['categories/课程/index', 'categories/课程/数字信号处理/index'],
      created_at: '2026-01-01',
      updated_at: '2026-01-01'
    }, {
      title: '普通文章',
      slug: 'pu-tong-wen-zhang',
      url: './pu-tong-wen-zhang.html',
      tags: [],
      categories: ['课程'],
      subcategory: '数字信号处理',
      aliases: [],
      created_at: '2026-01-02',
      updated_at: '2026-01-02'
    }];

    buildTaxonomyPages(paths, posts, buildContext, taxonomy);

    const publicFiles = [];
    (function walk(dir) {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else publicFiles.push(path.relative(path.join(root, 'public'), full));
      }
    })(path.join(root, 'public'));

    const catPath = publicFiles.find(p => p === 'categories/ke-cheng/index.html');
    const subPath = publicFiles.find(p => p === 'categories/ke-cheng/shu-zi-xin-hao-chu-li/index.html');

    assert(catPath, 'category hub page should exist: ' + publicFiles.join(', '));
    assert(subPath, 'subcategory hub page should exist: ' + publicFiles.join(', '));

    const catHtml = fs.readFileSync(path.join(root, 'public', catPath), 'utf8');
    const subHtml = fs.readFileSync(path.join(root, 'public', subPath), 'utf8');

    assert(catHtml.includes('数字信号处理｜课程笔记中枢页'), catHtml);
    assert(subHtml.includes('数字信号处理｜课程笔记中枢页'), subHtml);
    assert(!catHtml.includes('http-equiv="refresh"'), catHtml);
    assert(!subHtml.includes('http-equiv="refresh"'), subHtml);
  }
};

module.exports = { tests, name: 'taxonomy-alias-redirect' };
