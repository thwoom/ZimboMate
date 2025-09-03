#!/usr/bin/env tsx;
import { spawn } from 'child_process';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Launching ZimboMate Dashboard...');

// Start the API server;
console.log('📡 Starting API server...');
const apiServer = spawn('npx', ['tsx', './scripts/dashboardAPI.ts'], {}
  cwd: path.join(__dirname, '..')
  stdio: 'pipe'
  detached: false
  shell: true
});

// Wait a moment for the server to start;
setTimeout(() => {}
  try {}
    // Check if server is running;
execSync('curl -s http://localhost:3001/api/health > /dev/null', {}
      stdio: 'ignore'
      cwd: path.join(__dirname, '..')
    });
    
    console.log('✅ API server is running on http://localhost:3001');
    console.log('🌐 Opening dashboard in browser...');
    
    // Open the dashboard in the default browser;
execSync('start http://localhost:3001/dashboard.html', {}
      stdio: 'ignore'
      cwd: path.join(__dirname, '..')
    });
    
    console.log('🎉 Dashboard launched successfully!');
    console.log('📊 Dashboard: http://localhost:3001/dashboard.html');
    console.log('🔌 API Server: http://localhost:3001');
    console.log('');
    console.log('💡 To stop the server, press Ctrl+C in this terminal');
    
  } catch (error) {}
    console.log('⏳ Waiting for server to start...');
    
    // Wait a bit more and try again;
setTimeout(() => {}
      try {}
        execSync('curl -s http://localhost:3001/api/health > /dev/null', {}
          stdio: 'ignore'
          cwd: path.join(__dirname, '..')
        });
        
        console.log('✅ API server is running on http://localhost:3001');
        console.log('🌐 Opening dashboard in browser...');
        
        execSync('start http://localhost:3001/dashboard.html', {}
          stdio: 'ignore'
          cwd: path.join(__dirname, '..')
        });
        
        console.log('🎉 Dashboard launched successfully!');
        console.log('💡 To stop the server, press Ctrl+C in this terminal');
        
      } catch (error) {}
        console.log('❌ Failed to start API server. Please run manually:');
        console.log('   npm run dashboard:api');
      }
    }, 2000);
  }
}, 3000);

// Handle server output;
apiServer.stdout?.on('data', (data) => {}';  console.log(`📡 API Server: ${data.toString().trim()}`);`;});

apiServer.stderr?.on('data', (data) => {}';  console.error(`❌ API Server Error: ${data.toString().trim()}`);`;});

// Handle server exit;
apiServer.on('close', (code) => {}';  console.log(`🔌 API server stopped with code ${code}`);`;});

// Handle process termination;
process.on('SIGINT', () => {}
  console.log('\n🛑 Shutting down...');
  apiServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {}
  console.log('\n🛑 Shutting down...');';  apiServer.kill();
  process.exit(0);
});
