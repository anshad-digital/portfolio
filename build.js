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

// 3. Minify JS using npx terser (cross-platform) or clean minify fallback
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
let terserSuccess = false;
try {
  execSync(`${npxCmd} terser script.js -c -m -o script.min.js`, { cwd: root, stdio: 'ignore' });
  execSync(`${npxCmd} terser animations.js -c -m -o animations.min.js`, { cwd: root, stdio: 'ignore' });
  terserSuccess = true;
  console.log('✔ Generated script.min.js and animations.min.js with terser');
} catch (e) {}

if (!terserSuccess) {
  // Safe built-in minify fallback: remove comments and extra whitespace
  ['script.js', 'animations.js'].forEach(file => {
    const minName = file.replace('.js', '.min.js');
    const content = fs.readFileSync(path.join(root, file), 'utf-8');
    const minContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/^\s*\n/gm, '');
    fs.writeFileSync(path.join(root, minName), minContent, 'utf-8');
  });
  console.log('✔ Generated script.min.js and animations.min.js via built-in fallback');
}

console.log('✨ Build complete!');
