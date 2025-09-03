#!/usr / bin / env tsx

import { execSync } from 'node:child_process';
import { existsSync,readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

import cors from 'cors';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = 3001;

// Create HTTP server for WebSocket support
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    clients.delete(ws);
  });
});

// Broadcast function for real-time updates
function broadcast(data: unknown) {
  const message = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(process.cwd()));

// API Routes
app.get('/api / semgrep / stats', (req, res) => {
  try {
    // Try to read the latest Semgrep report
    const _reportPath = join(process.cwd(), 'semgrep-report.json');
    if (existsSync(reportPath)) {
      const _report = JSON.parse(readFileSync(reportPath, 'utf8'));
      res.json({
        totalIssues: report.summary?.totalIssues || 0,
        securityIssues: report.summary?.byCategory?.security || 0,
        qualityIssues: report.summary?.byCategory?.quality || 0,
        fixableIssues: 0 // We'll need to calculate this from results
      });
    } else {
      res.json({
        totalIssues: 0,
        securityIssues: 0,
        qualityIssues: 0,
        fixableIssues: 0
      });
    }
  } catch {
    res.json({
      totalIssues: 0,
      securityIssues: 0,
      qualityIssues: 0,
      fixableIssues: 0
    });
  }
});

app.post('/api / semgrep / scan', async (req, res) => {
  try {
    // Broadcast scan start
    broadcast({
      type: 'scan_started',
      message: 'Starting security scan...',
      timestamp: Date.now()
    });

    // Simulate progress updates (since Semgrep doesn't provide real-time progress)
    const progressSteps = [
      { percent: 10, message: 'Initializing scan...' },
      { percent: 25, message: 'Scanning TypeScript files...' },
      { percent: 50, message: 'Analyzing security patterns...' },
      { percent: 75, message: 'Checking quality rules...' },
      { percent: 90, message: 'Finalizing results...' }
    ];

    // Send progress updates
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      broadcast({
        type: 'scan_progress',
        percent: step.percent,
        message: step.message,
        timestamp: Date.now()
      });
    }

    // Run Semgrep scan
    execSync('semgrep scan --config .semgrep.yml --json --output semgrep-results.json', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Read results
    const resultsPath = join(process.cwd(), 'semgrep-results.json');
    if (existsSync(resultsPath)) {
      const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

      // Broadcast scan completion
      broadcast({
        type: 'scan_completed',
        totalIssues: results.results?.length || 0,
        message: `Scan completed with ${results.results?.length || 0} issues found`,
        timestamp: Date.now()
      });

      res.json({
        success: true,
        totalIssues: results.results?.length || 0,
        message: `Scan completed with ${results.results?.length || 0} issues found`
      });
    } else {
      broadcast({
        type: 'scan_completed',
        totalIssues: 0,
        message: 'Scan completed with no issues found',
        timestamp: Date.now()
      });

      res.json({
        success: true,
        totalIssues: 0,
        message: 'Scan completed with no issues found'
      });
    }
  } catch {
    // Broadcast scan failure
    broadcast({
      type: 'scan_failed',
      error: 'Scan failed',
      message: 'Run manually: npm run semgrep:scan',
      timestamp: Date.now()
    });

    res.status(500).json({
      success: false,
      error: 'Scan failed',
      message: 'Run manually: npm run semgrep:scan'
    });
  }
});

app.post('/api / semgrep / autofix', async (req, res) => {
  try {
    // Run Semgrep autofix
    execSync('semgrep scan --config .semgrep.yml --autofix', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    res.json({
      success: true,
      fixedIssues: 'Unknown', // Semgrep doesn't report exact count
      message: 'Auto-fixes applied successfully'
    });
  } catch {
    res.status(500).json({
      success: false,
      error: 'Auto-fix failed',
      message: 'Run manually: npm run semgrep:autofix'
    });
  }
});

app.post('/api / semgrep / tasks', async (req, res) => {
  try {
    // Run the full Semgrep integration
    execSync('npm run semgrep', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Read the generated report
    const _reportPath = join(process.cwd(), 'semgrep-report.json');
    if (existsSync(reportPath)) {
      const _report = JSON.parse(readFileSync(reportPath, 'utf8'));

      // Get recent tasks from the active tasks directory
      const tasksDir = join(process.cwd(), 'ops', 'tasks', 'active');
      const fs = require('node:fs');
      let recentTasks = [];

      if (existsSync(tasksDir)) {
        const taskFiles = fs.readdirSync(tasksDir)
          .filter(file => file.startsWith('semgrep-') && file.endsWith('.yaml'))
          .slice(0, 5); // Get last 5 tasks

        recentTasks = taskFiles.map(file => ({
          icon: '🔒',
          title: file.replace('.yaml', '').replace('semgrep-', ''),
          description: 'Semgrep issue task',
          status: '📋'
        }));
      }

      res.json({
        success: true,
        tasksCreated: report.summary?.totalIssues || 0,
        recentTasks,
        message: 'Tasks generated successfully'
      });
    } else {
      res.json({
        success: true,
        tasksCreated: 0,
        recentTasks: [],
        message: 'No tasks generated'
      });
    }
  } catch {
    res.status(500).json({
      success: false,
      error: 'Task generation failed',
      message: 'Run manually: npm run semgrep'
    });
  }
});

app.get('/api / semgrep / report', (req, res) => {
  try {
    const reportPath = join(process.cwd(), 'semgrep-report.json');
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      res.json(report);
    } else {
      res.status(404).json({
        error: 'Report not found',
        message: 'Run Semgrep first to generate a report'
      });
    }
  } catch {
    res.status(500).json({
      error: 'Failed to read report',
      message: 'Run manually: npm run semgrep:report'
    });
  }
});

// Serve the dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'dashboard.html'));
});

// Start server
server.listen(PORT, () => {
  });

export default app;
