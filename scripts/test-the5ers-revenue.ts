#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testThe5ersRevenue() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const the5ers = firms.find(f => f.firmName === 'The5ers')!
    
    console.log('=== The5ers Revenue Card Test ===')
    console.log(`Previous Week (D): $${the5ers.revenuePrevious.toLocaleString()}`)
    console.log(`Current Week (E): $${the5ers.revenueCurrent.toLocaleString()}`)
    console.log(`Expected change: -66.28%`)
    
    const competitors = getContextualRanking(firms, the5ers)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(the5ers))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/the5ers?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing The5ers RevenueCard with negative change...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/revenue-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'The5ers_Revenue_Card_Negative.png') })
    
    console.log('✅ Screenshot saved: output/revenue-tests/The5ers_Revenue_Card_Negative.png')
    console.log('Should show:')
    console.log('- Blue bar (Current): $16,510 (smaller)')
    console.log('- Gray bar (Previous): $48,960 (larger)')
    console.log('- Red badge: -66.28%')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testThe5ersRevenue()