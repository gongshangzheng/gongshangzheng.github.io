---
title: Welcome to My Blog
description: A minimalist blog powered by pure HTML
date: 2026-05-16
page_style: |
  .hero { height: 55vh; min-height: 360px; }
  .post-list { list-style: none; padding: 0; }
  .post-list li { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
  .post-list li:last-child { border-bottom: none; }
  .post-list .post-date { font-size: 0.82rem; color: var(--fg-faint); }
  .post-list .post-title { font-size: 1.15rem; font-weight: 600; margin-top: 4px; }
  .post-list .post-title a { color: var(--fg); text-decoration: none; }
  .post-list .post-title a:hover { color: var(--accent); }
  .post-list .post-desc { font-size: 0.9rem; color: var(--fg-muted); margin-top: 6px; }
hero_title: Welcome
hero_sub: 纯 HTML 博客
hero_tagline: No frameworks. No dependencies. Just static files.
---

<div class="section">
  <h2 class="section-title">Latest Posts</h2>
  <ul class="post-list">
    <li>
      <div class="post-date">2026-05-16</div>
      <div class="post-title"><a href="/about.html">About This Blog</a></div>
      <div class="post-desc">A minimalist blog built with pure HTML, CSS, and JavaScript.</div>
    </li>
  </ul>
</div>

<div class="section">
  <h2 class="section-title">Features</h2>
  <div class="card-grid">
    <div class="card">
      <div style="font-size:2rem;margin-bottom:12px">🌓</div>
      <h3>Dark / Light Mode</h3>
      <p>Toggle with the button in the navigation bar. Follows system preference.</p>
    </div>
    <div class="card">
      <div style="font-size:2rem;margin-bottom:12px">🎵</div>
      <h3>Music Player</h3>
      <p>Embed audio players in your posts with the music-player component.</p>
    </div>
    <div class="card">
      <div style="font-size:2rem;margin-bottom:12px">📱</div>
      <h3>Responsive</h3>
      <p>Works on all devices with a mobile-friendly hamburger menu.</p>
    </div>
    <div class="card">
      <div style="font-size:2rem;margin-bottom:12px">⚡</div>
      <h3>Zero Dependencies</h3>
      <p>No JavaScript frameworks, no build dependencies. Pure vanilla.</p>
    </div>
  </div>
</div>