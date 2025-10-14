#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command: string, description: string) {
  log(`\n${colors.bold}${colors.blue}Running: ${description}${colors.reset}`)
  log(`${colors.yellow}Command: ${command}${colors.reset}`)
  
  try {
    execSync(command, { stdio: 'inherit' })
    log(`✅ ${description} completed successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    return false
  }
}

function checkDependencies() {
  log(`\n${colors.bold}${colors.blue}Checking dependencies...${colors.reset}`)
  
  const packageJsonPath = join(process.cwd(), 'package.json')
  if (!existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red')
    return false
  }
  
  log('✅ package.json found', 'green')
  return true
}

function installDependencies() {
  log(`\n${colors.bold}${colors.blue}Installing dependencies...${colors.reset}`)
  
  try {
    execSync('npm install', { stdio: 'inherit' })
    log('✅ Dependencies installed successfully', 'green')
    return true
  } catch (error) {
    log('❌ Failed to install dependencies', 'red')
    return false
  }
}

function runTests() {
  const tests = [
    {
      command: 'npm run test',
      description: 'Unit Tests (Jest)'
    },
    {
      command: 'npm run test:coverage',
      description: 'Unit Tests with Coverage'
    },
    {
      command: 'npm run test:e2e',
      description: 'End-to-End Tests (Playwright)'
    }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    if (runCommand(test.command, test.description)) {
      passedTests++
    }
  }
  
  return { passedTests, totalTests }
}

function generateReport(passedTests: number, totalTests: number) {
  log(`\n${colors.bold}${colors.blue}Test Summary${colors.reset}`)
  log(`Total Tests: ${totalTests}`)
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow')
  log(`Failed: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'red')
  
  if (passedTests === totalTests) {
    log(`\n🎉 All tests passed! UrutiIQ system is working correctly.`, 'green')
  } else {
    log(`\n⚠️  Some tests failed. Please check the output above for details.`, 'yellow')
  }
}

function main() {
  log(`${colors.bold}${colors.blue}UrutiIQ Comprehensive Test Suite${colors.reset}`)
  log('Testing entire system integration...\n')
  
  // Check if we're in the right directory
  if (!checkDependencies()) {
    log('❌ Please run this script from the frontend directory', 'red')
    process.exit(1)
  }
  
  // Install dependencies if needed
  const nodeModulesExists = existsSync(join(process.cwd(), 'node_modules'))
  if (!nodeModulesExists) {
    log('Installing dependencies...')
    if (!installDependencies()) {
      log('❌ Failed to install dependencies', 'red')
      process.exit(1)
    }
  }
  
  // Run all tests
  const { passedTests, totalTests } = runTests()
  
  // Generate report
  generateReport(passedTests, totalTests)
  
  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1)
}

if (require.main === module) {
  main()
}

export { main as runTests }
