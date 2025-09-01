#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';

async function fixMovesPanel() {
  console.log('🔧 Starting MovesPanel.tsx specific fixes...\n');
  
  const file = 'src/panels/MovesPanel/MovesPanel.tsx';
  
  try {
    const content = await readFile(file, 'utf-8');
    let newContent = content;
    let fileFixed = false;
    const issues: string[] = [];
    
    // Fix _character -> character in the getAllMoves function
    if (newContent.includes('if (_character) {')) {
      newContent = newContent.replace(/if \(_character\) \{/g, 'if (character) {');
      issues.push('Fixed _character -> character in getAllMoves');
      fileFixed = true;
    }
    
    // Fix the moves variable issue in getFilteredMoves
    if (newContent.includes('moves = moves.filter')) {
      newContent = newContent.replace(/moves = moves\.filter/g, '_moves = _moves.filter');
      issues.push('Fixed moves -> _moves in getFilteredMoves');
      fileFixed = true;
    }
    
    // Fix the return statement
    if (newContent.includes('return moves;')) {
      newContent = newContent.replace(/return moves;/g, 'return _moves;');
      issues.push('Fixed return moves -> return _moves');
      fileFixed = true;
    }
    
    // Fix the updateCharacter casting issue
    if (newContent.includes('(updateCharacter as string)')) {
      newContent = newContent.replace(/\(updateCharacter as string\)/g, 'updateCharacter');
      issues.push('Fixed updateCharacter casting');
      fileFixed = true;
    }
    
    if (fileFixed) {
      await writeFile(file, newContent, 'utf-8');
      console.log(`✅ ${file}`);
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log(`ℹ️  No issues found in ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
  
  console.log(`\n🎉 Fix complete!`);
}

fixMovesPanel().catch(console.error);
