#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testRevenueCard() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== FundingPips Revenue Card Test ===')
    console.log(`Previous Week (D): $${fundingPips.revenuePrevious.toLocaleString()}`)
    console.log(`Current Week (E): $${fundingPips.revenueCurrent.toLocaleString()}`)
    console.log(`Expected change: +27.69%`)
    
    const competitors = getContextualRanking(firms, fundingPips)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing RevenueCard with real CSV data...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/revenue-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_Revenue_Card.png') })
    
    console.log('✅ Screenshot saved: output/revenue-tests/FundingPips_Revenue_Card.png')
    console.log('Should show:')
    console.log('- Blue bar (Current): $100,680')
    console.log('- Gray bar (Previous): $78,850')
    console.log('- Green badge: +27.69%')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testRevenueCard()