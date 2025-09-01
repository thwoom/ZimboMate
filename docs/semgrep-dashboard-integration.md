# 🔒 Semgrep Dashboard Integration

## Overview

The Semgrep Dashboard Integration provides a web-based interface for managing security scans, quality checks, and automated task generation from your ZimboMate project. Instead of running commands manually in the terminal, you can now use an interactive dashboard to monitor and manage your code quality.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Dashboard Server

```bash
npm run semgrep:dashboard
```

### 3. Open the Dashboard

Navigate to `http://localhost:3001` in your browser.

## 🎯 Dashboard Features

### Real-Time Monitoring
- **Security Issues**: Track critical security vulnerabilities
- **Quality Issues**: Monitor code quality and best practices
- **Logic Issues**: Identify potential bugs and logic problems
- **Auto-Fixable Issues**: See how many issues can be automatically resolved

### Interactive Actions
- **🔍 Run Security Scan**: Execute Semgrep analysis with one click
- **🔧 Apply Auto-Fixes**: Automatically fix simple issues
- **📋 Generate Tasks**: Create manageable tasks from Semgrep results
- **📊 View Report**: See detailed analysis reports

### Command Integration
All dashboard actions are backed by the same commands you'd run manually:
- `npm run semgrep` - Full analysis with task generation
- `npm run semgrep:scan` - Quick security scan
- `npm run semgrep:autofix` - Apply automatic fixes
- `npm run semgrep:report` - Generate detailed reports

## 🏗️ Architecture

### Frontend (Dashboard)
- **HTML Dashboard**: `dashboard.html` with Semgrep integration
- **Interactive Buttons**: One-click execution of Semgrep commands
- **Real-Time Updates**: Live status and progress indicators
- **Responsive Design**: Works on desktop and mobile devices

### Backend (API Server)
- **Express Server**: `scripts/semgrepDashboardServer.ts`
- **API Endpoints**: RESTful API for Semgrep operations
- **Command Execution**: Runs Semgrep CLI commands
- **File Integration**: Reads and processes Semgrep results

### Integration Layer
- **Task Generation**: Automatically creates tasks from Semgrep findings
- **Report Processing**: Parses and displays Semgrep JSON output
- **Status Tracking**: Monitors operation progress and results

## 🔌 API Endpoints

### GET `/api/semgrep/stats`
Returns current Semgrep statistics:
```json
{
  "totalIssues": 4038,
  "securityIssues": 0,
  "qualityIssues": 5,
  "fixableIssues": 0
}
```

### POST `/api/semgrep/scan`
Executes a Semgrep security scan:
```json
{
  "success": true,
  "totalIssues": 4038,
  "message": "Scan completed with 4038 issues found"
}
```

### POST `/api/semgrep/autofix`
Applies automatic fixes:
```json
{
  "success": true,
  "fixedIssues": "Unknown",
  "message": "Auto-fixes applied successfully"
}
```

### POST `/api/semgrep/tasks`
Generates tasks from Semgrep results:
```json
{
  "success": true,
  "tasksCreated": 20,
  "recentTasks": [...],
  "message": "Tasks generated successfully"
}
```

### GET `/api/semgrep/report`
Returns detailed Semgrep analysis report:
```json
{
  "summary": {
    "totalIssues": 20,
    "bySeverity": {...},
    "byCategory": {...}
  },
  "issues": [...]
}
```

## 🎨 Customization

### Dashboard Styling
The dashboard uses the same Rose Pine theme as your main application:
- Dark mode with green accents
- Responsive grid layout
- Consistent button and card styling

### Task Generation
Tasks are automatically categorized and prioritized:
- **Security**: High priority, immediate attention required
- **Quality**: Medium priority, code improvement opportunities
- **Logic**: Medium priority, potential bug fixes
- **Performance**: Low priority, optimization opportunities

### Issue Grouping
Instead of creating thousands of individual tasks, the system groups issues by:
- **Category**: Security, quality, logic, performance
- **File**: All issues in one file become one task
- **Severity**: Prioritized by highest severity first

## 🚨 Troubleshooting

### Common Issues

#### Dashboard Won't Start
```bash
# Check if dependencies are installed
npm install

# Verify TypeScript compilation
npx tsc --noEmit

# Check for port conflicts
netstat -an | findstr :3001
```

#### Semgrep Commands Fail
```bash
# Verify Semgrep installation
semgrep --version

# Check configuration
cat .semgrep.yml

# Run manual scan
npm run semgrep:scan
```

#### API Errors
- Check browser console for error messages
- Verify the dashboard server is running
- Check network tab for failed requests
- Ensure CORS is properly configured

### Manual Fallbacks
If the dashboard fails, you can always run commands manually:
```bash
# Full analysis
npm run semgrep

# Quick scan
npm run semgrep:scan

# Apply fixes
npm run semgrep:autofix

# Generate report
npm run semgrep:report
```

## 🔮 Future Enhancements

### Planned Features
- **Real-time Monitoring**: WebSocket updates for live scan progress
- **Custom Rules**: Dashboard for managing Semgrep rule configurations
- **Team Collaboration**: Share scan results and task assignments
- **Integration APIs**: Connect with other development tools
- **Advanced Analytics**: Trend analysis and issue tracking over time

### Extensibility
The dashboard is designed to be easily extensible:
- Add new API endpoints for custom functionality
- Integrate with CI/CD pipelines
- Connect with issue tracking systems
- Support multiple Semgrep configurations

## 📚 Related Documentation

- [Semgrep Integration Setup](./semgrep-integration.md)
- [Task Management System](../ops/tasks/README.md)
- [Dashboard Configuration](./dashboard-configuration.md)
- [API Reference](./api-reference.md)

## 🤝 Contributing

To contribute to the Semgrep dashboard:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Setup
```bash
# Install development dependencies
npm install

# Start development server
npm run semgrep:dashboard

# Run tests
npm test

# Check code quality
npm run lint
```

---

**🎉 The Semgrep Dashboard Integration transforms your code quality management from manual terminal commands to an interactive, visual experience that makes security and quality monitoring accessible to the entire team!**
