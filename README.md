# ZimboMate Workspace

A monorepo containing two main projects:

## 📦 Packages

### `@zimbo-mate/task-manager`
Advanced task management system with complexity scoring, risk analysis, and dependency management. Includes:
- Enhanced task management scripts
- Dashboard and API functionality
- Semgrep integration
- Workflow automation tools
- Testing and linting utilities

### `@zimbo-mate/dungeon-world`
Dungeon World Control Panel - A comprehensive game management interface built with React.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
# Install all dependencies
npm install

# Or install specific package
npm install --workspace=dungeon-world
npm install --workspace=task-manager
```

### Development

#### Run Dungeon World Control Panel
```bash
npm run dev
# or
npm run dev --workspace=dungeon-world
```

#### Run Task Manager
```bash
npm run dev --workspace=task-manager
```

#### Build All Packages
```bash
npm run build
```

#### Run Tests
```bash
npm run test
```

## 📁 Project Structure

```
ZimboMate/
├── packages/
│   ├── task-manager/          # Task management system
│   │   ├── src/               # Source code
│   │   ├── scripts/           # Task management scripts
│   │   ├── tools/             # CLI tools
│   │   ├── ops/               # Task operations
│   │   └── claude-task-master/ # Advanced task management
│   └── dungeon-world/         # Game control panel
│       ├── src/               # React application
│       ├── tests/             # Test files
│       └── dist/              # Build output
├── package.json               # Root workspace config
└── README.md                  # This file
```

## 🔧 Available Scripts

### Root Workspace
- `npm run dev` - Start Dungeon World development server
- `npm run build` - Build all packages
- `npm run test` - Run tests for all packages
- `npm run lint` - Lint all packages

### Task Manager Package
- `npm run tm:enhanced` - Run enhanced task manager
- `npm run dashboard` - Launch task dashboard
- `npm run semgrep:scan` - Run Semgrep security scan

### Dungeon World Package
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test:e2e` - Run end-to-end tests

## 🤝 Contributing

1. Make changes in the appropriate package directory
2. Run tests: `npm run test`
3. Run linting: `npm run lint`
4. Commit your changes

## 📄 License

This project is licensed under the MIT License.
