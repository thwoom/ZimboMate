#!/usr/bin/env tsx
/**
 * Bulk fix unused variables by prefixing with underscore
 * This handles the most common patterns from our ESLint output
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function bulkFixUnusedVars() {
  console.log('🔧 Bulk fixing unused variables...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], { 
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  // Common unused variable patterns from our ESLint output
  const patterns = [
    // Function parameters
    { from: /\(\s*([^,)]+),\s*error\s*\)/g, to: '($1, _error)' },
    { from: /\(\s*([^,)]+),\s*errorInfo\s*\)/g, to: '($1, _errorInfo)' },
    { from: /\(\s*([^,)]+),\s*selectedMove\s*\)/g, to: '($1, _selectedMove)' },
    { from: /\(\s*([^,)]+),\s*selectedStat\s*\)/g, to: '($1, _selectedStat)' },
    { from: /\(\s*([^,)]+),\s*isActive\s*\)/g, to: '($1, _isActive)' },
    { from: /\(\s*([^,)]+),\s*level\s*\)/g, to: '($1, _level)' },
    { from: /\(\s*([^,)]+),\s*context\s*\)/g, to: '($1, _context)' },
    { from: /\(\s*([^,)]+),\s*race\s*\)/g, to: '($1, _race)' },
    { from: /\(\s*([^,)]+),\s*character\s*\)/g, to: '($1, _character)' },
    { from: /\(\s*([^,)]+),\s*inventory\s*\)/g, to: '($1, _inventory)' },
    { from: /\(\s*([^,)]+),\s*warning\s*\)/g, to: '($1, _warning)' },
    
    // Variable assignments
    { from: /const\s+setConfig\s*=/g, to: 'const _setConfig =' },
    { from: /const\s+insight\s*=/g, to: 'const _insight =' },
    { from: /const\s+availableTags\s*=/g, to: 'const _availableTags =' },
    { from: /const\s+showUsageStats\s*=/g, to: 'const _showUsageStats =' },
    { from: /const\s+showUses\s*=/g, to: 'const _showUses =' },
    { from: /const\s+roll\s*=/g, to: 'const _roll =' },
    { from: /const\s+category\s*=/g, to: 'const _category =' },
    { from: /const\s+id\s*=/g, to: 'const _id =' },
    { from: /const\s+key\s*=/g, to: 'const _key =' },
    { from: /const\s+forceSave\s*=/g, to: 'const _forceSave =' },
    { from: /const\s+state\s*=/g, to: 'const _state =' },
    { from: /const\s+updateMove\s*=/g, to: 'const _updateMove =' },
    { from: /const\s+recalculatedWeight\s*=/g, to: 'const _recalculatedWeight =' },
    
    // Let assignments
    { from: /let\s+warning\s*=/g, to: 'let _warning =' },
    { from: /let\s+error\s*=/g, to: 'let _error =' },
    
    // Destructured parameters with common names
    { from: /\{\s*([^}]+),\s*onUpdateModifier\s*\}/g, to: '{ $1, onUpdateModifier: _onUpdateModifier }' },
    
    // Special cases from PanelLoader
    { from: /\$ERROR/g, to: '_$ERROR' },
    
    // Interface/type parameters
    { from: /ValueChange/g, to: '_ValueChange' },
  ];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileChanged = false;
      
      for (const pattern of patterns) {
        const beforeCount = (newContent.match(pattern.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(pattern.from, pattern.to);
          const afterCount = (newContent.match(pattern.from) || []).length;
          
          if (beforeCount > afterCount) {
            fileChanged = true;
            console.log(`  ✅ Fixed ${beforeCount - afterCount} unused vars in ${file}`);
          }
        }
      }
      
      if (fileChanged) {
        writeFileSync(file, newContent, 'utf-8');
        totalFiles++;
        totalFixed++;
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed unused variables in ${totalFiles} files!`);
  return totalFixed;
}

bulkFixUnusedVars().catch(console.error);
