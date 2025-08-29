#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testE8Markets() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')!
    
    console.log('=== E8 Markets (Position 3) ===')
    const competitors = getContextualRanking(firms, e8Markets)
    console.log('Contextual ranking:')
    competitors.forEach(f => {
      const displayName = f.firmName === e8Markets.firmName ? f.firmName : '???'
      console.log(`  #${f.currentPosition} - ${displayName}`)
    })
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(e8Markets))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/${e8Markets.firmName.toLowerCase().replace(/\s+/g, '-')}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking E8 Markets screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/position-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'E8_Markets_position_3_corrected.png') })
    
    console.log('✅ Screenshot saved: output/position-tests/E8_Markets_position_3_corrected.png')
    console.log('Should show positions: #1, #2, #3 (E8 Markets), #4, #5')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testE8Markets()