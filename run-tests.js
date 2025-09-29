/**
 * Simple test runner for CRUD validation
 * Run with: node run-tests.js
 */

const { runTests } = require('./test-crud-validation.js')

console.log('🧪 CRUD Validation Test Suite')
console.log('===============================\n')

runTests()
  .then(results => {
    console.log('\n✅ Test execution completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
