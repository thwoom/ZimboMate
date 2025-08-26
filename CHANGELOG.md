# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- GitHub Actions CI/CD workflows
- Automated testing and linting
- Security scanning
- Dependabot configuration

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.0] - 2024-01-01

### Added
- Initial release
- Basic React + TypeScript setup
- Vite build configuration
- ESLint and Prettier setup
- Basic project structure

---

## Release Process

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. The changelog is automatically generated based on commit messages when creating releases.

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

### Creating a Release
1. Create a new tag: `git tag v1.0.0`
2. Push the tag: `git push origin v1.0.0`
3. The GitHub Action will automatically create a release with the changelog