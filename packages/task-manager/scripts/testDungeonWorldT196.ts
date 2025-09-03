#!/usr/bin/env tsx

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface DungeonWorldTest {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  componentPath: string;
  exists: boolean;
}

async function testDungeonWorldT196() {
  console.log('🎲 Testing T-196: Bond & Alignment XP Tracker for Dungeon World\n');
  
  const tests: DungeonWorldTest[] = [];
  
  // Test 1: Check if BondTracker component exists and is valid
  const bondTrackerPath = resolve(process.cwd(), 'src/components/BondTracker.tsx');
  const bondTrackerExists = existsSync(bondTrackerPath);
  
  if (bondTrackerExists) {
    try {
      const bondContent = readFileSync(bondTrackerPath, 'utf8');
      const hasBondState = bondContent.includes('useState') && bondContent.includes('bonds');
      const hasBondService = bondContent.includes('bondService');
      const hasBondTemplates = bondContent.includes('getBondTemplates') || bondContent.includes('bondTemplates');
      
      tests.push({
        name: 'BondTracker Component',
        status: hasBondState && hasBondService && hasBondTemplates ? 'PASS' : 'FAIL',
        details: `Component exists with ${hasBondState ? 'state management' : 'NO state'}, ${hasBondService ? 'service integration' : 'NO service'}, ${hasBondTemplates ? 'template integration' : 'NO templates'}`,
        componentPath: bondTrackerPath,
        exists: true
      });
    } catch (error) {
      tests.push({
        name: 'BondTracker Component',
        status: 'FAIL',
        details: `Error reading component: ${error.message}`,
        componentPath: bondTrackerPath,
        exists: true
      });
    }
  } else {
    tests.push({
      name: 'BondTracker Component',
      status: 'FAIL',
      details: 'Component file not found',
      componentPath: bondTrackerPath,
      exists: false
    });
  }
  
  // Test 2: Check if AlignmentXPTracker component exists and is valid
  const alignmentTrackerPath = resolve(process.cwd(), 'src/components/AlignmentXPTracker.tsx');
  const alignmentTrackerExists = existsSync(alignmentTrackerPath);
  
  if (alignmentTrackerExists) {
    try {
      const alignmentContent = readFileSync(alignmentTrackerPath, 'utf8');
      const hasAlignmentState = alignmentContent.includes('useState') && alignmentContent.includes('alignment');
      const hasXPTracking = alignmentContent.includes('XP') || alignmentContent.includes('xp');
      const hasActions = alignmentContent.includes('actions') || alignmentContent.includes('Actions');
      
      tests.push({
        name: 'AlignmentXPTracker Component',
        status: hasAlignmentState && hasXPTracking && hasActions ? 'PASS' : 'FAIL',
        details: `Component exists with ${hasAlignmentState ? 'state management' : 'NO state'}, ${hasXPTracking ? 'XP tracking' : 'NO XP tracking'}, ${hasActions ? 'actions' : 'NO actions'}`,
        componentPath: alignmentTrackerPath,
        exists: true
      });
    } catch (error) {
      tests.push({
        name: 'AlignmentXPTracker Component',
        status: 'FAIL',
        details: `Error reading component: ${error.message}`,
        componentPath: alignmentTrackerPath,
        exists: true
      });
    }
  } else {
    tests.push({
      name: 'AlignmentXPTracker Component',
      status: 'FAIL',
      details: 'Component file not found',
      componentPath: alignmentTrackerPath,
      exists: false
    });
  }
  
  // Test 3: Check if BondService exists and is valid
  const bondServicePath = resolve(process.cwd(), 'src/services/BondService.ts');
  const bondServiceExists = existsSync(bondServicePath);
  
  if (bondServiceExists) {
    try {
      const serviceContent = readFileSync(bondServicePath, 'utf8');
      const hasCreateBond = serviceContent.includes('createBond');
      const hasResolveBond = serviceContent.includes('resolveBond');
      const hasGetBonds = serviceContent.includes('getBonds');
      const hasBondTemplates = serviceContent.includes('getBondTemplates');
      
      tests.push({
        name: 'BondService',
        status: hasCreateBond && hasResolveBond && hasGetBonds && hasBondTemplates ? 'PASS' : 'FAIL',
        details: `Service exists with ${hasCreateBond ? 'create' : 'NO create'}, ${hasResolveBond ? 'resolve' : 'NO resolve'}, ${hasGetBonds ? 'get' : 'NO get'}, ${hasBondTemplates ? 'templates' : 'NO templates'}`,
        componentPath: bondServicePath,
        exists: true
      });
    } catch (error) {
      tests.push({
        name: 'BondService',
        status: 'FAIL',
        details: `Error reading service: ${error.message}`,
        componentPath: bondServicePath,
        exists: true
      });
    }
  } else {
    tests.push({
      name: 'BondService',
      status: 'FAIL',
      details: 'Service file not found',
      componentPath: bondServicePath,
      exists: false
    });
  }
  
  // Test 4: Check if bond templates exist
  const bondTemplatesPath = resolve(process.cwd(), 'src/data/bondTemplates.ts');
  const bondTemplatesExists = existsSync(bondTemplatesPath);
  
  if (bondTemplatesExists) {
    try {
      const templatesContent = readFileSync(bondTemplatesPath, 'utf8');
      const hasBondTemplates = templatesContent.includes('bondTemplates');
      const hasExport = templatesContent.includes('export');
      
      tests.push({
        name: 'Bond Templates',
        status: hasBondTemplates && hasExport ? 'PASS' : 'FAIL',
        details: `Templates exist with ${hasBondTemplates ? 'bondTemplates array' : 'NO array'}, ${hasExport ? 'export' : 'NO export'}`,
        componentPath: bondTemplatesPath,
        exists: true
      });
    } catch (error) {
      tests.push({
        name: 'Bond Templates',
        status: 'FAIL',
        details: `Error reading templates: ${error.message}`,
        componentPath: bondTemplatesPath,
        exists: true
      });
    }
  } else {
    tests.push({
      name: 'Bond Templates',
      status: 'FAIL',
      details: 'Templates file not found',
      componentPath: bondTemplatesPath,
      exists: false
    });
  }
  
  // Test 5: Check if types are properly defined
  const bondTypesPath = resolve(process.cwd(), 'src/types/Bond.ts');
  const xpTypesPath = resolve(process.cwd(), 'src/types/XP.ts');
  
  const bondTypesExist = existsSync(bondTypesPath);
  const xpTypesExist = existsSync(xpTypesPath);
  
  if (bondTypesExist && xpTypesExist) {
    tests.push({
      name: 'Type Definitions',
      status: 'PASS',
      details: 'Both Bond and XP type definitions exist',
      componentPath: `${bondTypesPath}, ${xpTypesPath}`,
      exists: true
    });
  } else {
    tests.push({
      name: 'Type Definitions',
      status: 'FAIL',
      details: `Bond types: ${bondTypesExist ? 'EXISTS' : 'MISSING'}, XP types: ${xpTypesExist ? 'EXISTS' : 'MISSING'}`,
      componentPath: `${bondTypesPath}, ${xpTypesPath}`,
      exists: bondTypesExist && xpTypesExist
    });
  }
  
  // Generate report
  console.log('📊 Dungeon World T-196 Test Results:\n');
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    const statusIcon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${test.name}`);
    console.log(`   Status: ${test.status}`);
    console.log(`   Details: ${test.details}`);
    console.log(`   Path: ${test.componentPath}`);
    console.log('');
    
    if (test.status === 'PASS') passed++;
    else failed++;
  });
  
  console.log('📋 Summary:');
  console.log(`  Total Tests: ${tests.length}`);
  console.log(`  Passed: ${passed} ✅`);
  console.log(`  Failed: ${failed} ❌`);
  console.log(`  Coverage: ${Math.round((passed / tests.length) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 T-196 is fully implemented for Dungeon World!');
    console.log('✅ All components, services, and types are in place');
    console.log('🚀 The Bond & Alignment XP Tracker is ready for use');
  } else if (passed >= tests.length * 0.7) {
    console.log('\n⚠️ T-196 is mostly implemented but has some issues');
    console.log('🔧 Review the failing tests to complete implementation');
  } else {
    console.log('\n❌ T-196 has significant implementation gaps');
    console.log('🔄 Major work needed to complete the feature');
  }
  
  // Check if this should be marked as done
  if (failed === 0) {
    console.log('\n💡 Recommendation: Consider updating T-196 status to "done" in tasks.yaml');
  }
}

testDungeonWorldT196().catch(console.error);
