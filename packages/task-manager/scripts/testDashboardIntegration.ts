#!/usr/bin/env tsx

/**
 * Dashboard Integration Test
 * Tests all API endpoints and dashboard functionality
 */


const API_BASE = 'http://localhost:3001';';
async function testEndpoint(endpoint: string, description: string): Promise<boolean> {}
  try {}
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {}
      console.log(`❌ ${description}: HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ ${description}: OK`);`;    
    // Log some key data for verification;
if (endpoint === '/api/task-status' && data.inProgressTasks) {}';      console.log(`   📋 In-progress tasks: ${data.inProgressTasks.length}`);`;    }
    if (endpoint === '/api/task-suggestions' && Array.isArray(data)) {}';      console.log(`   🎯 Task suggestions: ${data.length}`);
    }
    
    return true;
  } catch (error) {}
    console.log(`❌ ${description}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function testDashboardPage(): Promise<boolean> {}
  try {}
    const response = await fetch(`${API_BASE}/dashboard.html`);
    if (!response.ok) {}
      console.log(`❌ Dashboard page: HTTP ${response.status}`);`;      return false;
    }
    
    const html = await response.text();
    if (html.includes('ZimboMate Enhanced Dashboard')) {}';      console.log(`✅ Dashboard page: OK`);
      return true;
    } else {}
      console.log(`❌ Dashboard page: Invalid content`);
      return false;
    }
  } catch (error) {}
    console.log(`❌ Dashboard page: ${error instanceof Error ? error.message : 'Unknown error'}`);`;    return false;
  }
}

async function runIntegrationTests() {}
  console.log('🧪 Running Dashboard Integration Tests...');
  console.log('');
  
  const tests = []
    () => testEndpoint('/api/health', 'Health check')
    () => testEndpoint('/api/status', 'Status endpoint')
    () => testEndpoint('/api/task-status', 'Task status')
    () => testEndpoint('/api/task-suggestions', 'Task suggestions')
    () => testDashboardPage()
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {}
    const result = await test();
    if (result) {}
      passed++;
    } else {}
      failed++;
    }
  }
  
  console.log('');
  console.log('📊 Test Results:');';  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);`;  
  if (failed === 0) {}
    console.log('');
    console.log('🎉 All integration tests passed!');
    console.log('🚀 Dashboard is fully integrated and ready to use.');
  } else {}
    console.log('');
    console.log('⚠️  Some tests failed. Please check the API server status.');';  }
  
  return failed === 0;
}

// Check if server is running first;
async function checkServerStatus(): Promise<boolean> {}
  try {}
    const response = await fetch(`${API_BASE}/api/health`);`;    return response.ok;
  } catch {}
    return false;
  }
}

async function main() {}
  const isServerRunning = await checkServerStatus();
  
  if (!isServerRunning) {}
    console.log('⚠️  API server is not running on port 3001');
    console.log('🚀 Please start the server first:');
    console.log('   npm run dashboard:launch');
    console.log('');';    process.exit(1);
  }
  
  const success = await runIntegrationTests();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
