/**
 * build.js — Static Asset Minifier for Anshad Digital Portfolio
 * Run: node build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;

console.log('⚡ Building static production assets...');

// 1. Minify style.css -> style.min.css
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf-8');
const minCss = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*([\{\}:;,>+~])\s*/g, '$1')
  .replace(/;\}/g, '}')
  .replace(/\s+/g, ' ')
  .trim();
fs.writeFileSync(path.join(root, 'style.min.css'), minCss, 'utf-8');

// 2. Combine tailwind.min.css + style.min.css into main.min.css
const twCss = fs.readFileSync(path.join(root, 'tailwind.min.css'), 'utf-8');
fs.writeFileSync(path.join(root, 'main.min.css'), twCss + '\n' + minCss, 'utf-8');
console.log('✔ Generated style.min.css and main.min.css');

// 3. Minify JS using npx terser (cross-platform)
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
try {
  execSync(`${npxCmd} terser script.js -c -m -o script.min.js`, { cwd: root, stdio: 'ignore' });
  execSync(`${npxCmd} terser animations.js -c -m -o animations.min.js`, { cwd: root, stdio: 'ignore' });
  console.log('✔ Generated script.min.js and animations.min.js');
} catch (e) {
  console.warn('Note: terser run failed or not found, keeping existing minified JS.');
}

console.log('✨ Build complete!');
