#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testFavoritePercentage() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== FundingPips Favorite Percentage Test ===')
    console.log(`Previous Week (G): ${fundingPips.visitsPinkPrevious.toLocaleString()}`)
    console.log(`Current Week (H): ${fundingPips.visitsPinkCurrent.toLocaleString()}`)
    console.log(`Favorites Added (I): ${fundingPips.favoritesAdded.toLocaleString()}`)
    console.log(`Favorites Change (J): ${fundingPips.favoritesChange}%`)
    console.log(`Should display: ${fundingPips.favoritesChange}% (not calculated)`)
    
    const competitors = getContextualRanking(firms, fundingPips)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing FavoriteCard with real CSV percentage...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/favorite-percentage-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_Real_Percentage.png') })
    
    console.log('✅ Screenshot saved: output/favorite-percentage-tests/FundingPips_Real_Percentage.png')
    console.log(`MUST show exactly: +${fundingPips.favoritesChange}% (7.03%)`)
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFavoritePercentage()