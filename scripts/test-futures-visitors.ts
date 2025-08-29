#!/usr/bin/env node

import { globalConfig } from '../lib/globalConfig'

console.log('Testing Futures Visitors Configuration:')
console.log('=====================================')
console.log('CFD (Prop Trading) Visitors:', globalConfig.categories['prop-trading'].visitors)
console.log('Futures Visitors:', globalConfig.categories['futures'].visitors)
console.log('')
console.log('✅ Futures is now using the same value as CFD:', 
  globalConfig.categories['futures'].visitors === globalConfig.categories['prop-trading'].visitors)