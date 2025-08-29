#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testDashboardWorking() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== Testing Dashboard (After Git Reset) ===')
    console.log(`FundingPips CFD Share: ${fundingPips.cfdShare}%`)
    
    const competitors = getContextualRanking(firms, fundingPips)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing dashboard after git reset...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/after-reset'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_after_reset.png') })
    
    console.log('✅ Screenshot saved: output/after-reset/FundingPips_after_reset.png')
    console.log('Dashboard is working again!')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testDashboardWorking()