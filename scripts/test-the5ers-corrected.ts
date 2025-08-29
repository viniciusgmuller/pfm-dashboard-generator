#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testThe5ersCorrected() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const the5ers = firms.find(f => f.firmName === 'The5ers')!
    
    console.log('=== The5ers (Position 2) - Corrected ===')
    const competitors = getContextualRanking(firms, the5ers)
    console.log('Contextual ranking:')
    competitors.forEach(f => {
      const displayName = f.firmName === the5ers.firmName ? f.firmName : '???'
      console.log(`  #${f.currentPosition} - ${displayName}`)
    })
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(the5ers))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/the5ers?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking corrected The5ers screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/corrected-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'The5ers_position_2_CORRECTED.png') })
    
    console.log('✅ Screenshot saved: output/corrected-tests/The5ers_position_2_CORRECTED.png')
    console.log('Should show positions: #1, #2 (The5ers), #3, #4, #5')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testThe5ersCorrected()