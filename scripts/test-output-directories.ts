#!/usr/bin/env node

// Test script to verify output directory logic

console.log('Testing Output Directory Logic:')
console.log('================================')

// Test scenarios
const scenarios = [
  { input: 'data/weekly/data.csv', expected: './output/dashboards' },
  { input: 'data/weekly/datafutures.csv', expected: './output/futures' },
  { input: 'some/path/datafutures.csv', expected: './output/futures' },
  { input: 'prop-trading-data.csv', expected: './output/dashboards' }
]

scenarios.forEach(scenario => {
  let outputDir = './output/dashboards' // default
  
  // Apply the logic
  if (scenario.input.includes('datafutures')) {
    outputDir = './output/futures'
  }
  
  const passed = outputDir === scenario.expected
  const status = passed ? '✅' : '❌'
  
  console.log(`${status} Input: ${scenario.input}`)
  console.log(`   Output: ${outputDir} (expected: ${scenario.expected})`)
  console.log('')
})

console.log('Summary:')
console.log('- Files with "datafutures" in the name → ./output/futures')
console.log('- All other files → ./output/dashboards')