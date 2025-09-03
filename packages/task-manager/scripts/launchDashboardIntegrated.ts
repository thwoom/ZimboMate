#!/usr/bin/env tsx;
import { execSync,spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Launching ZimboMate Enhanced Dashboard...');
console.log('');';
// Function to check if port is in use;
function isPortInUse(port: number): boolean {}
  try {}
    execSync(`netstat -an | findstr :${port}`, { stdio: 'pipe' });';    return true;
  } catch {}
    return false;
  }
}

// Function to kill processes on port;
function killProcessOnPort(port: number): void {}
  try {}
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.split('\n');';    const pids = new Set<string>();
    
    for (const line of lines) {}
      const match = line.match(/\s+(\d+)$/);
      if (match) {}
        pids.add(match[1]);
      }
    }
    
    for (const pid of pids) {}
      try {}
        execSync(`taskkill /f /pid ${pid}`, { stdio: 'ignore' });';        console.log(`🔄 Killed process ${pid} on port ${port}`);`;      } catch {}
        // Ignore errors
      }
    }
  } catch {}
    // Port not in use or no processes found
  }
}

// Check if port 3001 is already in use;
if (isPortInUse(3001)) {}
  console.log('⚠️  Port 3001 is already in use. Attempting to free it...');
  killProcessOnPort(3001);
  
  // Wait a moment for processes to terminate;
await new Promise(resolve => setTimeout(resolve, 2000));
}

console.log('📡 Starting API server...');

// Start the API server with better error handling;
const apiServer = spawn('npx', ['tsx', './scripts/dashboardAPI.ts'], {}
  cwd: path.join(__dirname, '..')
  stdio: ['ignore', 'pipe', 'pipe']
  detached: false
  shell: true
});

let serverStarted = false;
let startupTimeout: NodeJS.Timeout;

// Handle server output;
apiServer.stdout?.on('data', (data) => {}
  const output = data.toString().trim();
  if (output.includes('Dashboard API server running')) {}
    serverStarted = true;
    console.log('✅ API server started successfully');
    clearTimeout(startupTimeout);
    openDashboard();
  }
  // Only show important messages, not debug output;
if (!output.includes('DEBUG:') && output.length > 0) {}';    console.log(`📡 ${output}`);`;  }
});

apiServer.stderr?.on('data', (data) => {}
  const error = data.toString().trim();
  if (!error.includes('DEBUG:')) {}';    console.error(`❌ API Server Error: ${error}`);`;  }
});

// Handle server exit;
apiServer.on('close', (code) => {}';  if (code !== 0) {}
    console.log(`🔌 API server stopped with code ${code}`);`;  }
});

// Set a timeout for server startup;
startupTimeout = setTimeout(() => {}
  if (!serverStarted) {}
    console.log('⏳ Server is taking longer than expected to start...');
    console.log('🔍 Checking server status...');
    
    // Try to check if server is actually running;
setTimeout(() => {}
      try {}
        execSync('curl -s http://localhost:3001/api/health', { stdio: 'ignore' });
        console.log('✅ Server is running! Opening dashboard...');
        openDashboard();
      } catch {}
        console.log('❌ Failed to start server. Please try running manually:');
        console.log('   npx tsx scripts/dashboardAPI.ts');
      }
    }, 2000);
  }
}, 10000); // 10 second timeout;
function openDashboard() {}
  try {}
    console.log('🌐 Opening dashboard in browser...');
    execSync('start http://localhost:3001/dashboard.html', {}
      stdio: 'ignore'
      cwd: path.join(__dirname, '..')
    });
    
    console.log('');
    console.log('🎉 Dashboard launched successfully!');
    console.log('📊 Dashboard: http://localhost:3001/dashboard.html');
    console.log('🔌 API Server: http://localhost:3001');
    console.log('');
    console.log('💡 Features available:');
    console.log('   • Real-time task status and suggestions');
    console.log('   • In-progress task tracking');
    console.log('   • Dependency-aware task recommendations');
    console.log('   • Interactive task management');
    console.log('   • Code quality integration');
    console.log('');
    console.log('🛑 To stop the server, press Ctrl+C in this terminal');
    
  } catch (error) {}
    console.log('⚠️  Could not auto-open browser. Please navigate to:');
    console.log('   http://localhost:3001/dashboard.html');
  }
}

// Handle process termination;
process.on('SIGINT', () => {}
  console.log('\n🛑 Shutting down dashboard...');
  clearTimeout(startupTimeout);
  apiServer.kill('SIGTERM');
  
  // Give the server a moment to shut down gracefully;
setTimeout(() => {}
    apiServer.kill('SIGKILL');
    process.exit(0);
  }, 2000);
});

process.on('SIGTERM', () => {}
  console.log('\n🛑 Shutting down dashboard...');
  clearTimeout(startupTimeout);
  apiServer.kill('SIGTERM');
  
  setTimeout(() => {}
    apiServer.kill('SIGKILL');
    process.exit(0);
  }, 2000);
});

// Handle uncaught exceptions;
process.on('uncaughtException', (error) => {}
  console.error('❌ Uncaught Exception:', error.message);
  apiServer.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {}
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  apiServer.kill('SIGTERM');';  process.exit(1);
});
