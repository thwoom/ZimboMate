# 🎭 Playwright E2E Testing for ZimboMate

This directory contains comprehensive end-to-end tests for the ZimboMate application using Playwright.

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:e2e
```

### Interactive Testing (UI Mode)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### View Test Report
```bash
npm run test:e2e:report
```

## 📁 Test Structure

```
tests/e2e/
├── README.md                 # This file
├── global-setup.ts          # Setup before all tests
├── global-teardown.ts       # Cleanup after all tests
├── utils/
│   └── test-helpers.ts      # Reusable test utilities
├── app.spec.ts              # Main app functionality tests
├── task-management.spec.ts  # Task management system tests
└── character-management.spec.ts # Character creation/management tests
```

## 🧪 Test Categories

### 1. App Navigation (`app.spec.ts`)
- App loading and initialization
- Panel navigation
- Error handling
- Performance metrics
- Responsive design testing

### 2. Task Management (`task-management.spec.ts`)
- Task creation and validation
- Task organization and filtering
- Workflow management
- Bulk operations
- Analytics and reporting

### 3. Character Management (`character-management.spec.ts`)
- Character creation and validation
- Stat calculations and advancement
- Equipment management
- Condition tracking
- Bonds and alignment

## 🛠️ Test Utilities

The `TestHelpers` class provides common testing operations:

```typescript
import { TestHelpers } from './utils/test-helpers';

const helpers = new TestHelpers(page);

// Wait for app to be ready
await helpers.waitForAppReady();

// Navigate to panels
await helpers.navigateToPanel('character-creation');

// Create test data
await helpers.createTestCharacter('Test Character', 'Wizard');
await helpers.createTestTask('Test Task', 'p1');

// Take debug screenshots
await helpers.takeDebugScreenshot('test-name');
```

## 🎯 Test Data

Common test data is available in `test-helpers.ts`:

```typescript
import { testData } from './utils/test-helpers';

// Predefined characters
const wizard = testData.characters.wizard;
const fighter = testData.characters.fighter;

// Predefined tasks
const simpleTask = testData.tasks.simple;
```

## 🔧 Configuration

Playwright configuration is in `playwright.config.ts`:

- **Browsers**: Chrome, Firefox, Safari (desktop + mobile)
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Auto-start**: Dev server starts automatically for tests
- **Parallel**: Tests run in parallel for speed
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Traces**: On first retry

## 📊 Test Reports

Tests generate multiple report formats:

- **HTML Report**: Interactive web report
- **JSON Report**: Machine-readable results
- **JUnit Report**: CI/CD integration
- **Screenshots**: Failure debugging
- **Videos**: Failure replay
- **Traces**: Step-by-step debugging

## 🚨 Debugging Tests

### 1. UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
- Visual test runner
- Step through tests
- Real-time debugging
- Record new tests

### 2. Debug Mode
```bash
npm run test:e2e:debug
```
- Pause on first line
- Step through code
- Inspect elements
- Console access

### 3. Headed Mode
```bash
npm run test:e2e:headed
```
- See browser actions
- Watch test execution
- Visual debugging

### 4. Screenshots and Videos
- Automatically captured on failure
- Stored in `test-results/`
- Great for debugging failures

## 🧹 Best Practices

### 1. Test Isolation
- Each test is independent
- Use `beforeEach` for setup
- Clean up after tests

### 2. Reliable Selectors
- Use `data-testid` attributes
- Avoid text-based selectors
- Prefer stable identifiers

### 3. Waiting Strategies
- Wait for network idle
- Wait for specific elements
- Avoid arbitrary timeouts

### 4. Test Data
- Use helper functions
- Create realistic test scenarios
- Clean up test data

## 🔍 Writing New Tests

### 1. Test Structure
```typescript
test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.click('[data-testid="button"]');
    
    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### 2. Adding Test IDs
In your React components:
```tsx
<button data-testid="create-character-btn">
  Create Character
</button>
```

### 3. Using Helpers
```typescript
const helpers = new TestHelpers(page);
await helpers.waitForAppReady();
await helpers.navigateToPanel('character-creation');
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    CI: true
```

### Local Development
```bash
# Run tests in watch mode
npm run test:e2e -- --watch

# Run specific test file
npm run test:e2e character-management.spec.ts

# Run tests matching pattern
npm run test:e2e -- --grep "character creation"
```

## 📈 Performance Testing

Tests include performance checks:
- App load time (< 3 seconds)
- Memory leak detection
- Responsive design validation
- Cross-browser compatibility

## 🎨 Visual Testing

- Mobile viewport testing (375x667)
- Tablet viewport testing (768x1024)
- Desktop viewport testing
- Responsive layout validation

## 🔧 Troubleshooting

### Common Issues

1. **Tests fail on CI but pass locally**
   - Check for environment differences
   - Verify dev server starts correctly
   - Check browser compatibility

2. **Flaky tests**
   - Add proper waiting strategies
   - Use stable selectors
   - Avoid race conditions

3. **Slow tests**
   - Run tests in parallel
   - Use headless mode in CI
   - Optimize test data setup

### Getting Help

- Check Playwright [documentation](https://playwright.dev/)
- Review test reports for detailed failure info
- Use UI mode for interactive debugging
- Check console logs for errors

## 🎯 Next Steps

1. **Add more test coverage** for specific features
2. **Implement visual regression testing** for UI consistency
3. **Add performance benchmarks** for critical user flows
4. **Set up test data factories** for complex scenarios
5. **Integrate with your task management system** for test tracking

---

Happy testing! 🎭✨
