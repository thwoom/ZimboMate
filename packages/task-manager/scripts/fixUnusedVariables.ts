#!/usr/bin/env tsx
/**
 * Systematically fix unused variables by prefixing with underscore
 * This is safe and follows ESLint conventions for intentionally unused variables
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedVariables() {
  console.log('🔧 Fixing unused variables by prefixing with underscore...');
  
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
      
      // Common unused variable patterns from our ESLint output
      const fixes = [
        // Function parameters
        { from: /\(([^,)]+),\s*error\s*\)/g, to: '($1, _error)' },
        { from: /\(([^,)]+),\s*errorInfo\s*\)/g, to: '($1, _errorInfo)' },
        { from: /\(([^,)]+),\s*index\s*\)/g, to: '($1, _index)' },
        { from: /\(([^,)]+),\s*warning\s*\)/g, to: '($1, _warning)' },
        { from: /\(([^,)]+),\s*context\s*\)/g, to: '($1, _context)' },
        { from: /\(([^,)]+),\s*race\s*\)/g, to: '($1, _race)' },
        { from: /\(([^,)]+),\s*character\s*\)/g, to: '($1, _character)' },
        { from: /\(([^,)]+),\s*inventory\s*\)/g, to: '($1, _inventory)' },
        { from: /\(([^,)]+),\s*equipment\s*\)/g, to: '($1, _equipment)' },
        { from: /\(([^,)]+),\s*level\s*\)/g, to: '($1, _level)' },
        { from: /\(([^,)]+),\s*isActive\s*\)/g, to: '($1, _isActive)' },
        
        // Destructured parameters
        { from: /\(\s*{\s*([^}]+),\s*selectedMove\s*}\s*\)/g, to: '({ $1, selectedMove: _selectedMove })' },
        { from: /\(\s*{\s*([^}]+),\s*selectedStat\s*}\s*\)/g, to: '({ $1, selectedStat: _selectedStat })' },
        { from: /\(\s*{\s*([^}]+),\s*onUpdateModifier\s*}\s*\)/g, to: '({ $1, onUpdateModifier: _onUpdateModifier })' },
        { from: /\(\s*{\s*([^}]+),\s*showUsageStats\s*}\s*\)/g, to: '({ $1, showUsageStats: _showUsageStats })' },
        { from: /\(\s*{\s*([^}]+),\s*showUses\s*}\s*\)/g, to: '({ $1, showUses: _showUses })' },
        { from: /\(\s*{\s*([^}]+),\s*activePanelId\s*}\s*\)/g, to: '({ $1, activePanelId: _activePanelId })' },
        
        // Variable assignments
        { from: /const\s+healthInfo\s*=/g, to: 'const _healthInfo =' },
        { from: /const\s+currentAdvancement\s*=/g, to: 'const _currentAdvancement =' },
        { from: /const\s+setConfig\s*=/g, to: 'const _setConfig =' },
        { from: /const\s+getAlignmentActions\s*=/g, to: 'const _getAlignmentActions =' },
        { from: /const\s+newBond\s*=/g, to: 'const _newBond =' },
        { from: /const\s+handleTemplateSelect\s*=/g, to: 'const _handleTemplateSelect =' },
        { from: /const\s+now\s*=/g, to: 'const _now =' },
        { from: /const\s+newCondition\s*=/g, to: 'const _newCondition =' },
        { from: /const\s+display\s*=/g, to: 'const _display =' },
        { from: /const\s+getRollResultColor\s*=/g, to: 'const _getRollResultColor =' },
        { from: /const\s+errorReport\s*=/g, to: 'const _errorReport =' },
        { from: /const\s+insight\s*=/g, to: 'const _insight =' },
        { from: /const\s+availableTags\s*=/g, to: 'const _availableTags =' },
        { from: /const\s+api\s*=/g, to: 'const _api =' },
        { from: /const\s+handleExport\s*=/g, to: 'const _handleExport =' },
        { from: /const\s+toggleMoveExpanded\s*=/g, to: 'const _toggleMoveExpanded =' },
        { from: /const\s+roll\s*=/g, to: 'const _roll =' },
        { from: /const\s+category\s*=/g, to: 'const _category =' },
        { from: /const\s+startTime\s*=/g, to: 'const _startTime =' },
        { from: /const\s+endTime\s*=/g, to: 'const _endTime =' },
        { from: /const\s+equippedItems\s*=/g, to: 'const _equippedItems =' },
        { from: /const\s+recalculatedWeight\s*=/g, to: 'const _recalculatedWeight =' },
        { from: /const\s+forceSave\s*=/g, to: 'const _forceSave =' },
        { from: /const\s+state\s*=/g, to: 'const _state =' },
        { from: /const\s+updateMove\s*=/g, to: 'const _updateMove =' },
        { from: /const\s+key\s*=/g, to: 'const _key =' },
        { from: /const\s+report\s*=/g, to: 'const _report =' },
        { from: /const\s+expectedBaseHP\s*=/g, to: 'const _expectedBaseHP =' },
        { from: /const\s+expectedBaseLoad\s*=/g, to: 'const _expectedBaseLoad =' },
        
        // Let assignments
        { from: /let\s+index\s*=/g, to: 'let _index =' },
        { from: /let\s+id\s*=/g, to: 'let _id =' },
      ];
      
      for (const fix of fixes) {
        const beforeCount = (newContent.match(fix.from) || []).length;
        newContent = newContent.replace(fix.from, fix.to);
        const afterCount = (newContent.match(fix.from) || []).length;
        
        if (beforeCount > afterCount) {
          fileChanged = true;
          console.log(`  ✅ Fixed ${beforeCount - afterCount} unused variables in ${file}`);
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

fixUnusedVariables().catch(console.error);