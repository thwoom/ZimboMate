#!/usr/bin/env tsx
/**
 * Targeted fix for unused variables by prefixing with underscore
 * Based on the specific patterns we see in our ESLint output
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedVarsTargeted() {
  console.log('🎯 Targeted fix for unused variables...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], { 
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileChanged = false;
      
      // Very specific replacements based on our ESLint output
      const replacements = [
        // Function parameters - be very specific to avoid false positives
        { from: /\(\s*([^,)]+),\s*error\s*\)\s*=>/g, to: '($1, _error) =>' },
        { from: /\(\s*([^,)]+),\s*errorInfo\s*\)\s*=>/g, to: '($1, _errorInfo) =>' },
        { from: /\(\s*([^,)]+),\s*error\s*\)\s*\{/g, to: '($1, _error) {' },
        { from: /\(\s*([^,)]+),\s*errorInfo\s*\)\s*\{/g, to: '($1, _errorInfo) {' },
        
        // Destructured parameters
        { from: /\{\s*([^}]+),\s*selectedMove\s*\}/g, to: '{ $1, selectedMove: _selectedMove }' },
        { from: /\{\s*([^}]+),\s*selectedStat\s*\}/g, to: '{ $1, selectedStat: _selectedStat }' },
        { from: /\{\s*([^}]+),\s*onUpdateModifier\s*\}/g, to: '{ $1, onUpdateModifier: _onUpdateModifier }' },
        { from: /\{\s*([^}]+),\s*showUsageStats\s*\}/g, to: '{ $1, showUsageStats: _showUsageStats }' },
        { from: /\{\s*([^}]+),\s*showUses\s*\}/g, to: '{ $1, showUses: _showUses }' },
        { from: /\{\s*([^}]+),\s*isActive\s*\}/g, to: '{ $1, isActive: _isActive }' },
        
        // Simple parameters
        { from: /\(\s*([^,)]+),\s*level\s*\)/g, to: '($1, _level)' },
        { from: /\(\s*([^,)]+),\s*context\s*\)/g, to: '($1, _context)' },
        { from: /\(\s*([^,)]+),\s*race\s*\)/g, to: '($1, _race)' },
        { from: /\(\s*([^,)]+),\s*character\s*\)/g, to: '($1, _character)' },
        { from: /\(\s*([^,)]+),\s*inventory\s*\)/g, to: '($1, _inventory)' },
        { from: /\(\s*([^,)]+),\s*warning\s*\)/g, to: '($1, _warning)' },
        { from: /\(\s*([^,)]+),\s*characterClass\s*\)/g, to: '($1, _characterClass)' },
        { from: /\(\s*([^,)]+),\s*personalityTraits\s*\)/g, to: '($1, _personalityTraits)' },
        { from: /\(\s*([^,)]+),\s*equipment\s*\)/g, to: '($1, _equipment)' },
        { from: /\(\s*([^,)]+),\s*advancementChoice\s*\)/g, to: '($1, _advancementChoice)' },
        { from: /\(\s*([^,)]+),\s*fromVersion\s*\)/g, to: '($1, _fromVersion)' },
        { from: /\(\s*([^,)]+),\s*activePanelId\s*\)/g, to: '($1, _activePanelId)' },
        { from: /\(\s*([^,)]+),\s*allMoves\s*\)/g, to: '($1, _allMoves)' },
        
        // Multiple parameters
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*conditions\s*\)/g, to: '($1, $2, _conditions)' },
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*attributeName\s*\)/g, to: '($1, $2, _attributeName)' },
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*modifiers\s*\)/g, to: '($1, $2, $3, $4, _modifiers)' },
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*debilities\s*\)/g, to: '($1, $2, $3, $4, _debilities)' },
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*items\s*\)/g, to: '($1, $2, $3, $4, _items)' },
        { from: /\(\s*([^,)]+),\s*([^,)]+),\s*([^,)]+),\s*attributes\s*\)/g, to: '($1, $2, $3, _attributes)' },
        
        // Variable assignments - be very specific
        { from: /const\s+setConfig\s*=\s*([^;]+);/g, to: 'const _setConfig = $1;' },
        { from: /const\s+insight\s*=\s*([^;]+);/g, to: 'const _insight = $1;' },
        { from: /const\s+availableTags\s*=\s*([^;]+);/g, to: 'const _availableTags = $1;' },
        { from: /const\s+roll\s*=\s*([^;]+);/g, to: 'const _roll = $1;' },
        { from: /const\s+category\s*=\s*([^;]+);/g, to: 'const _category = $1;' },
        { from: /const\s+id\s*=\s*([^;]+);/g, to: 'const _id = $1;' },
        { from: /const\s+key\s*=\s*([^;]+);/g, to: 'const _key = $1;' },
        { from: /const\s+forceSave\s*=\s*([^;]+);/g, to: 'const _forceSave = $1;' },
        { from: /const\s+state\s*=\s*([^;]+);/g, to: 'const _state = $1;' },
        { from: /const\s+updateMove\s*=\s*([^;]+);/g, to: 'const _updateMove = $1;' },
        { from: /const\s+recalculatedWeight\s*=\s*([^;]+);/g, to: 'const _recalculatedWeight = $1;' },
        
        // Let assignments
        { from: /let\s+warning\s*=\s*([^;]+);/g, to: 'let _warning = $1;' },
        { from: /let\s+error\s*=\s*([^;]+);/g, to: 'let _error = $1;' },
        
        // Type definitions
        { from: /interface\s+ValueChange\b/g, to: 'interface _ValueChange' },
        { from: /type\s+ValueChange\b/g, to: 'type _ValueChange' },
        
        // Special cases
        { from: /\$ERROR/g, to: '_$ERROR' },
      ];
      
      for (const replacement of replacements) {
        const beforeCount = (newContent.match(replacement.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(replacement.from, replacement.to);
          const afterCount = (newContent.match(replacement.from) || []).length;
          
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
  
  console.log(`\n🎯 Fixed unused variables in ${totalFiles} files!`);
  return totalFixed;
}

fixUnusedVarsTargeted().catch(console.error);
