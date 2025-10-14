# UrutiIQ Comprehensive Test Suite

This directory contains comprehensive tests for the entire UrutiIQ system, covering unit tests, integration tests, and end-to-end tests.

## 🧪 Test Structure

```
__tests__/
├── components/           # Unit tests for React components
│   ├── dashboard.test.tsx
│   ├── ai-insights.test.tsx
│   ├── banking.test.tsx
│   ├── demand-forecasting.test.tsx
│   └── auto-bookkeeper.test.tsx
├── integration/         # Integration tests
│   └── react-query.test.tsx
├── e2e/                 # End-to-end tests
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── navigation.spec.ts
├── test-runner.ts       # Comprehensive test runner
└── README.md           # This file
```

## 🚀 Running Tests

### Quick Start
```bash
# Run all tests
npm run test:all

# Run comprehensive test suite with custom runner
npm run test:runner
```

### Individual Test Types

#### Unit Tests (Jest + React Testing Library)
```bash
# Run unit tests
npm run test

# Run with watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

#### End-to-End Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## 📋 Test Coverage

### Unit Tests
- **Dashboard Page**: Navigation, quick actions, financial overview
- **AI Insights**: Tab switching, AI features, predictions
- **Banking**: Account management, transactions, reconciliation
- **Demand Forecasting**: AI forecasting, product analysis, trends
- **Auto-Bookkeeper**: AI processing, learning progress, settings

### Integration Tests
- **React Query**: Data fetching, caching, mutations, error handling
- **API Integration**: Authentication, data flow, state management

### End-to-End Tests
- **Authentication Flow**: Login, logout, session management
- **Dashboard Navigation**: Quick actions, routing, responsive design
- **Navigation System**: Sidebar, search, mobile navigation

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- Next.js integration
- TypeScript support
- React Testing Library setup
- Coverage thresholds (70% minimum)
- Module path mapping

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Automatic dev server startup
- Trace collection for debugging

### Test Setup (`jest.setup.js`)
- Global mocks for Next.js components
- Browser API mocks (speech recognition, localStorage)
- Console warning suppression
- Custom matchers

## 📊 Test Data & Mocks

### Mock Data
- User authentication data
- Company and product information
- Financial transactions
- AI insights and predictions

### API Mocks
- Banking API responses
- Accounting data
- User management
- Error scenarios

## 🎯 Testing Best Practices

### Component Testing
- Test user interactions
- Verify prop handling
- Check accessibility
- Validate responsive behavior

### Integration Testing
- Test data flow
- Verify API integration
- Check error handling
- Validate caching behavior

### E2E Testing
- Test complete user workflows
- Verify cross-browser compatibility
- Check mobile responsiveness
- Validate authentication flows

## 🐛 Debugging Tests

### Unit Test Debugging
```bash
# Run specific test file
npm test -- dashboard.test.tsx

# Run with verbose output
npm test -- --verbose

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Test Debugging
```bash
# Run with headed browser
npx playwright test --headed

# Run with debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## 📈 Coverage Reports

### Unit Test Coverage
- Generated in `coverage/` directory
- HTML report: `coverage/lcov-report/index.html`
- Threshold: 70% for branches, functions, lines, statements

### E2E Test Reports
- HTML report generated automatically
- Screenshots and videos for failed tests
- Trace files for debugging

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## 🚨 Common Issues

### Test Failures
1. **Port conflicts**: Ensure dev server port 3000 is available
2. **Timeout issues**: Increase timeout in test configuration
3. **Mock issues**: Check mock implementations in `jest.setup.js`

### E2E Issues
1. **Browser installation**: Run `npx playwright install`
2. **Environment variables**: Set required env vars for testing
3. **Database state**: Ensure clean test database

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing](https://nextjs.org/docs/testing)

## 🤝 Contributing

When adding new tests:
1. Follow existing test patterns
2. Add appropriate mocks
3. Update coverage thresholds if needed
4. Document new test scenarios
5. Ensure tests are deterministic and reliable
