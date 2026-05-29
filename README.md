# gongshangzheng.github.io

A minimalist blog built with pure HTML, CSS, and JavaScript. No frameworks.

## Quick Start

```bash
npm install
node build.js
```

## Features

- 🌓 Dark/Light mode
- 🎵 Music player support
- 📱 Responsive design
- ⚡ Zero dependencies

## Deployment

Push to GitHub and GitHub Actions will auto-build and deploy.

## Music

Add music with the `<music-player>` tag in Markdown:

```html
<music-player title="Track Name" src="/assets/media/song.mp3"></music-player>
```

Or use native audio:

```html
<audio controls src="/assets/media/song.mp3"></audio>
```