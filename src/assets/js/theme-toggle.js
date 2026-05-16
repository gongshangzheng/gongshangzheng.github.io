/*
 * 主题切换 + 导航栏滚动 + 移动端菜单 JS
 *
 * 使用方法：在 HTML 末尾 </body> 前复制到 <script> 标签中。
 * 页面需包含（见组装指南）：
 *   1. <button class="theme-toggle" onclick="toggleTheme()">🌓 切换主题</button>
 *   2. <nav class="hana-nav"> 导航栏（含 nav-hamburger 按钮和 nav-links）
 *
 * 功能：
 * - 主题切换：localStorage 持久化，跟随系统 prefers-color-scheme
 * - 导航栏滚动：向下滚隐藏、向上滚显示、滚出 hero 后加背景
 * - 移动端菜单：点击 hamburger 展开/收起导航链接
 */

function toggleTheme() {
  var b = document.body;
  if (b.classList.contains('dark-mode')) {
    b.classList.replace('dark-mode', 'light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    b.classList.replace('light-mode', 'dark-mode');
    localStorage.setItem('theme', 'dark');
  }
}

// 恢复上次设置或跟随系统（只保留一份，不要重复）
(function () {
  var t = localStorage.getItem('theme');
  if (t) {
    document.body.classList.add(t + '-mode');
  } else {
    document.body.classList.add(
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode'
    );
  }
})();

// 导航栏滚动行为：向下滚动隐藏、向上滚动显示、滚动后添加背景
(function(){
  var nav = document.querySelector('.hana-nav');
  if (!nav) return;
  var lastScroll = 0;
  window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > 80) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
    if (currentScroll > lastScroll && currentScroll > 200) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastScroll = currentScroll;
  });
})();

// 移动端 hamburger 菜单：点击展开/收起，点击外部关闭，点击链接后关闭
(function(){
  var nl=document.getElementById('nav-links'), hb=document.getElementById('nav-hamburger');
  if (!nl || !hb) return;
  hb.addEventListener('click', function(e) {
    e.stopPropagation();
    nl.classList.toggle('is-open');
  });
  document.addEventListener('click', function() {
    nl.classList.remove('is-open');
  });
  nl.addEventListener('click', function(e) {
    if (e.target.tagName === 'A') nl.classList.remove('is-open');
  });
})();
