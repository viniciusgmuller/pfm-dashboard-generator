#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testFTMOCorrected() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const ftmo = firms.find(f => f.firmName === 'FTMO')!
    
    console.log('=== FTMO Revenue Test (Corrected) ===')
    console.log(`Previous Week (D): $${ftmo.revenuePrevious.toLocaleString()}`)
    console.log(`Current Week (E): $${ftmo.revenueCurrent.toLocaleString()}`)
    console.log(`Should show: Previous Week $0, Current Week $225`)
    
    const competitors = getContextualRanking(firms, ftmo)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(ftmo))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/ftmo?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing FTMO with corrected zero handling...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/ftmo-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FTMO_Zero_Previous_CORRECTED.png') })
    
    console.log('✅ Screenshot saved: output/ftmo-tests/FTMO_Zero_Previous_CORRECTED.png')
    console.log('Should show:')
    console.log('- Blue bar (Current): $225')
    console.log('- Gray bar (Previous): $0 (NO placeholder)')
    console.log('- Badge should show appropriate percentage or +100%')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFTMOCorrected()