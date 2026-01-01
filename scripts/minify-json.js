import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow passing a directory as an argument, default to 'dist'
const targetDir = process.argv[2] || 'dist';
const DIST_DIR = path.resolve(__dirname, '..', targetDir);

/**
 * Convert unicode characters to escape sequences (\uXXXX)
 * @param {string} str - The string to process
 * @returns {string} - The string with unicode characters escaped
 */
function escapeUnicode(str) {
  return str.replace(/[\u0080-\uffff]/g, (char) => {
    return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
  });
}

/**
 * Recursively finds and minifies all JSON files in a directory
 * @param {string} dir - The directory to search
 */
function minifyJSONFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      minifyJSONFiles(filePath);
    } else if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Parse and stringify to minify
        const minified = JSON.stringify(JSON.parse(content));
        // Escape unicode characters to preserve \uXXXX format
        const escaped = escapeUnicode(minified);
        fs.writeFileSync(filePath, escaped);
        console.log(`✓ Minified: ${path.relative(DIST_DIR, filePath)}`);
      } catch (err) {
        console.error(`✗ Error minifying ${filePath}: ${err.message}`);
      }
    }
  }
}

console.log(`\n🔍 Minifying JSON files in ${targetDir}...\n`);
minifyJSONFiles(DIST_DIR);
console.log('\n✨ JSON minification complete!\n');
