import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'packages/dungeon-world/src/panels/ContentStudioPanel/ContentStudioPanel.tsx');

console.log('🔧 Fixing ContentStudioPanel.tsx argument name clashes...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix fieldErrors.map((index, index) => (error.message))
  content = content.replace(
    /fieldErrors\.map\(\(index, index\) => \(/g,
    'fieldErrors.map((error, index) => ('
  );
  
  // Fix fieldWarnings.map((index, index) => (warning.message))
  content = content.replace(
    /fieldWarnings\.map\(\(index, index\) => \(/g,
    'fieldWarnings.map((warning, index) => ('
  );
  
  // Fix the error.message and warning.message references
  content = content.replace(
    /\{error\.message\}/g,
    '{error.message}'
  );
  
  content = content.replace(
    /\{warning\.message\}/g,
    '{warning.message}'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ ContentStudioPanel.tsx fixed successfully!');
  
} catch (error) {
  console.error('❌ Error fixing ContentStudioPanel.tsx:', error.message);
}
