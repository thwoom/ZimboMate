# Semgrep Integration for ZimboMate

## Overview

This document describes the integration of Semgrep into the ZimboMate task management suite for advanced security and logic bug detection. Semgrep complements ESLint by providing pattern-based security scanning that catches issues ESLint doesn't cover.

## What is Semgrep?

Semgrep is a fast, open-source static analysis tool that:
- Detects security vulnerabilities and logic bugs
- Uses pattern matching for precise issue detection
- Provides autofix capabilities for simple patterns
- Supports TypeScript, JavaScript, and many other languages
- Is free and well-documented

## Features

### Security Patterns
- **Unsafe innerHTML usage** - Detects potential XSS vulnerabilities
- **eval() usage** - Identifies dangerous code execution
- **Unsafe fetch configurations** - Flags potential data exposure
- **File path traversal** - Catches directory traversal vulnerabilities
- **Unsafe YAML parsing** - Identifies potential injection attacks

### Logic Bug Detection
- **Missing Promise error handling** - Catches unhandled rejections
- **Unsafe React ref access** - Prevents null reference errors
- **Performance anti-patterns** - Identifies inefficient code patterns

### Autofix Capabilities
- Automatically adds missing `.catch()` handlers
- Replaces unsafe patterns with safer alternatives
- Fixes simple code quality issues

## Installation

### Prerequisites
- Node.js 18+
- Python 3.7+ (for Semgrep CLI)

### Setup
1. **Install Semgrep CLI:**
   ```bash
   # Using pip (recommended)
   pip install semgrep
   
   # Or using npm
   npm install -g @semgrep/semgrep
   ```

2. **Verify installation:**
   ```bash
   semgrep --version
   ```

3. **Run initial scan:**
   ```bash
   npm run semgrep
   ```

## Usage

### Basic Commands

```bash
# Full analysis with task generation
npm run semgrep

# Quick scan only
npm run semgrep:scan

# Apply autofixes
npm run semgrep:autofix

# Generate report only
npm run semgrep:report
```

### CI/CD Integration

The integration includes GitHub Actions workflows that:
- Run on every push and pull request
- Generate detailed reports
- Comment on PRs with results
- Fail builds on critical security issues
- Upload results as artifacts

### Task Management Integration

Semgrep issues are automatically converted to tasks in the task management system:
- Each issue becomes a task in `ops/tasks/active/`
- Tasks include severity, location, and suggested fixes
- Tasks are categorized by type (security, performance, quality, logic)
- Metadata includes Semgrep-specific information

## Configuration

### Main Configuration (`.semgrep.yml`)

The main configuration file defines:
- **Security rules** for TypeScript/React
- **Performance patterns** for optimization
- **Code quality rules** for maintainability
- **Project-specific patterns** for task management

### Custom Rules

You can add custom rules for project-specific patterns:

```yaml
- id: custom.unsafe-task-parsing
  pattern: |
    JSON.parse($INPUT)
  message: "Unsafe JSON parsing. Validate input structure."
  severity: WARNING
  languages: [typescript]
```

## Rule Categories

### Security Rules
- **typescript.security.unsafe-innerhtml** - XSS prevention
- **typescript.security.eval-usage** - Code injection prevention
- **typescript.security.unsafe-fetch** - Data exposure prevention
- **task-manager.file-path-traversal** - Path validation

### Performance Rules
- **typescript.performance.expensive-operation** - Optimization suggestions
- **typescript.performance.unnecessary-spread** - Array operation optimization

### Quality Rules
- **typescript.quality.unused-variable** - Code cleanup
- **typescript.quality.console-log** - Production code cleanup

## Workflow Integration

### Development Workflow
1. **Pre-commit:** Run `npm run semgrep:scan` to check for issues
2. **Code Review:** Review generated tasks for security issues
3. **Fix Issues:** Apply suggested fixes or implement custom solutions
4. **Test:** Verify fixes don't introduce new issues

### CI/CD Workflow
1. **Automated Scan:** GitHub Actions runs Semgrep on every PR
2. **Report Generation:** Detailed reports are generated and uploaded
3. **PR Comments:** Results are posted as PR comments
4. **Build Control:** Critical issues can fail the build

## Best Practices

### Security
- **Review all security warnings** - Don't ignore security issues
- **Understand the context** - Not all warnings are critical
- **Test fixes thoroughly** - Security fixes can introduce bugs
- **Document decisions** - Explain why certain patterns are acceptable

### Performance
- **Profile before optimizing** - Don't optimize prematurely
- **Measure impact** - Verify performance improvements
- **Consider trade-offs** - Readability vs. performance

### Maintenance
- **Update rules regularly** - Keep up with security best practices
- **Customize for your needs** - Add project-specific patterns
- **Review false positives** - Adjust rules to reduce noise
- **Document custom rules** - Explain why patterns are important

## Troubleshooting

### Common Issues

**Semgrep not found:**
```bash
# Install using pip
pip install semgrep

# Or using npm
npm install -g @semgrep/semgrep
```

**Too many false positives:**
- Review and adjust rule severity levels
- Add exclusions for known safe patterns
- Create custom rules for project-specific needs

**Slow performance:**
- Exclude unnecessary directories in `.semgrep.yml`
- Use `--quiet` flag for CI runs
- Consider running on specific directories only

### Getting Help

- [Semgrep Documentation](https://semgrep.dev/docs/)
- [Semgrep Rules Registry](https://semgrep.dev/r)
- [Community Discord](https://discord.gg/6YVK2B8)
- [GitHub Issues](https://github.com/returntocorp/semgrep/issues)

## Future Enhancements

### Planned Features
- **Custom rule development** - Project-specific security patterns
- **Integration with IDE** - Real-time feedback in development
- **Advanced autofix** - More sophisticated automatic fixes
- **Performance profiling** - Integration with performance monitoring

### Rule Expansion
- **React-specific patterns** - Component security and performance
- **Task management patterns** - Domain-specific security rules
- **API security patterns** - Backend integration security
- **Data validation patterns** - Input sanitization and validation

## Contributing

### Adding New Rules
1. Identify the pattern to detect
2. Create a rule in `.semgrep.yml`
3. Test with existing codebase
4. Document the rule and its purpose
5. Add to CI/CD pipeline

### Improving Integration
1. Enhance task generation logic
2. Improve autofix capabilities
3. Add more detailed reporting
4. Optimize performance

## Conclusion

Semgrep integration provides a robust security and quality scanning layer that complements existing tools like ESLint. By automatically generating tasks for issues and providing autofix capabilities, it helps maintain code quality and security without overwhelming developers.

The integration is designed to be:
- **Non-intrusive** - Advisory tool that doesn't block development
- **Comprehensive** - Covers security, performance, and quality
- **Actionable** - Generates specific tasks with suggested fixes
- **Maintainable** - Easy to configure and extend

For questions or suggestions, please refer to the troubleshooting section or create an issue in the project repository.
