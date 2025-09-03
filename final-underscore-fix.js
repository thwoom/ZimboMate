/**
 * Final Underscore Variable Fix - Mass Pattern Elimination
 * Fix the systematic _variable → variable pattern across all files
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FINAL UNDERSCORE VARIABLE PATTERN ELIMINATION');
console.log('=================================================');

// Comprehensive underscore variable patterns from the lint analysis
const UNDERSCORE_PATTERNS = [
  // Test file patterns (most common)
  { pattern: /_result/g, replacement: 'result', desc: '_result → result' },
  { pattern: /_character/g, replacement: 'character', desc: '_character → character' },
  { pattern: /_stats/g, replacement: 'stats', desc: '_stats → stats' },
  { pattern: /_move/g, replacement: 'move', desc: '_move → move' },
  { pattern: /_inventory/g, replacement: 'inventory', desc: '_inventory → inventory' },
  { pattern: /_item/g, replacement: 'item', desc: '_item → item' },
  { pattern: /_tags/g, replacement: 'tags', desc: '_tags → tags' },
  { pattern: /_condition/g, replacement: 'condition', desc: '_condition → condition' },
  { pattern: /_prd/g, replacement: 'prd', desc: '_prd → prd' },
  { pattern: /_parser/g, replacement: 'parser', desc: '_parser → parser' },
  
  // Service file patterns
  { pattern: /_newTasks/g, replacement: 'newTasks', desc: '_newTasks → newTasks' },
  { pattern: /_formatted/g, replacement: 'formatted', desc: '_formatted → formatted' },
  { pattern: /_roll/g, replacement: 'roll', desc: '_roll → roll' },
  { pattern: /_sorted/g, replacement: 'sorted', desc: '_sorted → sorted' },
  { pattern: /_effects/g, replacement: 'effects', desc: '_effects → effects' },
  
  // Utility patterns
  { pattern: /_equippedItems/g, replacement: 'equippedItems', desc: '_equippedItems → equippedItems' },
  { pattern: /_weapons/g, replacement: 'weapons', desc: '_weapons → weapons' },
  { pattern: /_allItems/g, replacement: 'allItems', desc: '_allItems → allItems' },
  { pattern: /_allMoves/g, replacement: 'allMoves', desc: '_allMoves → allMoves' },
  { pattern: /_activeConditions/g, replacement: 'activeConditions', desc: '_activeConditions → activeConditions' },
  { pattern: /_ongoingEffects/g, replacement: 'ongoingEffects', desc: '_ongoingEffects → ongoingEffects' },
  
  // Specific variable patterns
  { pattern: /_value/g, replacement: 'value', desc: '_value → value' },
  { pattern: /_modifier/g, replacement: 'modifier', desc: '_modifier → modifier' },
  { pattern: /_currentStat/g, replacement: 'currentStat', desc: '_currentStat → currentStat' },
  { pattern: /_availableMoves/g, replacement: 'availableMoves', desc: '_availableMoves → availableMoves' },
  { pattern: /_armorValue/g, replacement: 'armorValue', desc: '_armorValue → armorValue' },
  { pattern: /_damageValue/g, replacement: 'damageValue', desc: '_damageValue → damageValue' },
  { pattern: /_piercingValue/g, replacement: 'piercingValue', desc: '_piercingValue → piercingValue' },
  { pattern: /_armorPlusValue/g, replacement: 'armorPlusValue', desc: '_armorPlusValue → armorPlusValue' },
  
  // Complex patterns
  { pattern: /_weightToReduce/g, replacement: 'weightToReduce', desc: '_weightToReduce → weightToReduce' },
  { pattern: /_testPrdPath/g, replacement: 'testPrdPath', desc: '_testPrdPath → testPrdPath' },
  { pattern: /_samplePRD/g, replacement: 'samplePRD', desc: '_samplePRD → samplePRD' },
  { pattern: /_testContent/g, replacement: 'testContent', desc: '_testContent → testContent' },
  { pattern: /_existingContent/g, replacement: 'existingContent', desc: '_existingContent → existingContent' },
  { pattern: /_newContent/g, replacement: 'newContent', desc: '_newContent → newContent' },
  { pattern: /_contentSet/g, replacement: 'contentSet', desc: '_contentSet → contentSet' }
];

let totalFiles = 0;
let fixedFiles = 0;
let totalFixes = 0;
const fixStats = {};

function findAllFiles(dir) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(findAllFiles(fullPath));
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return files;
}

function fixUnderscoreVariables(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    const appliedFixes = [];
    
    // Apply all underscore patterns
    for (const pattern of UNDERSCORE_PATTERNS) {
      const beforeContent = newContent;
      newContent = newContent.replace(pattern.pattern, pattern.replacement);
      
      if (newContent !== beforeContent) {
        const matches = beforeContent.match(pattern.pattern);
        const count = matches ? matches.length : 0;
        if (count > 0) {
          appliedFixes.push(`${pattern.desc}: ${count} fixes`);
          fixStats[pattern.desc] = (fixStats[pattern.desc] || 0) + count;
          totalFixes += count;
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      fixedFiles++;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}`);
      appliedFixes.forEach(fix => console.log(`   • ${fix}`));
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Scanning all TypeScript files...\n');
  
  // Find all source and test files
  const allFiles = [
    ...findAllFiles(path.join(process.cwd(), 'src')),
    ...findAllFiles(path.join(process.cwd(), 'test'))
  ];
  
  console.log(`📁 Found ${allFiles.length} files to process\n`);
  console.log('🔧 Applying comprehensive underscore variable fixes...\n');
  
  // Process all files
  for (const file of allFiles) {
    fixUnderscoreVariables(file);
  }
  
  console.log('\n🎉 FINAL UNDERSCORE VARIABLE FIX COMPLETE!');
  console.log('==========================================');
  console.log(`📊 Files Processed: ${totalFiles}`);
  console.log(`✅ Files Fixed: ${fixedFiles}`);
  console.log(`🔧 Total Fixes Applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n📋 Top Fixes by Pattern:');
    Object.entries(fixStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([pattern, count]) => {
        console.log(`   ${pattern}: ${count} fixes`);
      });
    
    console.log('\n🚀 MASSIVE IMPACT EXPECTED:');
    console.log('   • Hundreds of no-undef errors should be eliminated');
    console.log('   • Test files should now pass variable reference checks');
    console.log('   • Source files should be significantly cleaner');
    
    console.log('\n📊 Next: Check impact with lint analysis');
  }
}

main();
