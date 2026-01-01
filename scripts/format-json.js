import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2] || 'public';
const BASE_DIR = path.resolve(__dirname, '..', targetDir);

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
 * Recursively finds and formats all JSON files in a directory
 * @param {string} dir - The directory to search
 */
function formatJSONFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      formatJSONFiles(filePath);
    } else if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Parse and stringify with indentation
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        // Escape unicode characters to preserve \uXXXX format
        const escaped = escapeUnicode(formatted);
        fs.writeFileSync(filePath, escaped + '\n');
        console.log(`✓ Formatted: ${path.relative(BASE_DIR, filePath)}`);
      } catch (err) {
        console.error(`✗ Error formatting ${filePath}: ${err.message}`);
      }
    }
  }
}

console.log(`\n🔍 Formatting JSON files in ${targetDir}...\n`);
formatJSONFiles(BASE_DIR);
console.log('\n✨ JSON formatting complete!\n');
