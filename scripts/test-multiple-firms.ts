#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testMultipleFirms() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Test with Alpha Capital (#4) to see different competitors
    const alphaCap = firms.find(f => f.firmName === 'Alpha Capital')!
    
    console.log(`=== Testing Alpha Capital (#${alphaCap.currentPosition}) ===`)
    const contextual = getContextualRanking(firms, alphaCap, 3, 1)
    
    console.log('Expected ranking display:')
    contextual.forEach((firm, visualIndex) => {
      const displayName = firm.firmName === alphaCap.firmName ? firm.firmName : '???'
      console.log(`Visual position ${visualIndex + 1}: ${displayName} (#${firm.currentPosition})`)
      console.log(`   Revenue: $${firm.revenueCurrent.toLocaleString()}`)
      console.log(`   Favorites: ${firm.visitsPinkCurrent}`)
      console.log(`   Visits: ${firm.cfdShare}%`)
      console.log('')
    })

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(alphaCap))
    const competitorsParam = encodeURIComponent(JSON.stringify(contextual))
    
    const url = `http://localhost:3002/dashboard/${alphaCap.firmName.toLowerCase().replace(' ', '-')}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking Alpha Capital screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const outputDir = './output/data-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'Alpha_Capital_real_data.png') })
    
    console.log('✅ Screenshot saved: output/data-test/Alpha_Capital_real_data.png')
    console.log('✅ Expected: Alpha Capital highlighted in 4th visual position with real competitor data')
    
    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testMultipleFirms()