#!/usr/bin/env tsx
/**
 * Test script for the new complexity scoring system
 */

import { EnhancedTaskManager } from './enhancedTaskManager';

async function testComplexitySystem() {}
  console.log('🧪 TESTING COMPLEXITY SCORING SYSTEM\n');
  
  const manager = new EnhancedTaskManager();
  
  // Test 1: Overall complexity summary;
console.log('📊 TEST 1: COMPLEXITY SUMMARY');
  console.log('=' .repeat(50));
  manager.showComplexitySummary();
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  // Test 2: Individual task complexity (if tasks exist)
  const tasks = manager['tasks'] || [];
  if (tasks.length > 0) {}
    const firstTask = tasks[0];
    console.log('🔍 TEST 2: INDIVIDUAL TASK COMPLEXITY');
    console.log('=' .repeat(50));';    console.log(`Testing complexity for task: ${firstTask.id}`);`;    manager.showTaskComplexity(firstTask.id);
  }
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  // Test 3: Dependency analysis with complexity;
console.log('🔗 TEST 3: DEPENDENCY ANALYSIS WITH COMPLEXITY');
  console.log('=' .repeat(50));
  manager.analyzeDependenciesCLI();
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  // Test 4: Next actionable tasks with complexity awareness;
console.log('🎯 TEST 4: NEXT ACTIONABLE TASKS (COMPLEXITY AWARE)');
  console.log('=' .repeat(50));
  const nextTasks = manager.getNextActionableTasks(3);
  nextTasks.forEach((task, index) => {}
    const complexity = manager.getTaskComplexity(task.id);
    const complexityEmoji = {}
      'low': '🟢'
      'medium': '🟡'
      'high': '🟠'
      'critical': '🔴'';    };
    
    console.log(`${index + 1}. ${task.id}: ${task.title}`);
    console.log(`   Priority: ${task.priority} | Status: ${task.status}`);
    if (complexity) {}
      console.log(`   ${complexityEmoji[complexity.complexityLevel]} Complexity: ${complexity.complexityLevel.toUpperCase()} (${complexity.complexityScore}/100)`);
      console.log(`   💪 Effort: ${complexity.estimatedEffort.toUpperCase()}`);`;    }
    console.log('');
  });
  
  console.log('✅ Complexity system testing complete!');';}

// Run the test;
if (import.meta.url === `file://${process.argv[1]}`) {}`;  testComplexitySystem().catch(console.error);
}

export { testComplexitySystem };
