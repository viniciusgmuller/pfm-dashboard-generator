#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testFavoriteCard() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== FundingPips Favorite Card Test ===')
    console.log(`Previous Week (G): ${fundingPips.visitsPinkPrevious.toLocaleString()}`)
    console.log(`Current Week (H): ${fundingPips.visitsPinkCurrent.toLocaleString()}`)
    console.log(`Favorites Added (I): ${fundingPips.favoritesAdded.toLocaleString()}`)
    console.log(`Expected change: +7.56%`)
    
    const competitors = getContextualRanking(firms, fundingPips)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing FavoriteCard with real CSV data...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/favorite-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FundingPips_Favorite_Card.png') })
    
    console.log('✅ Screenshot saved: output/favorite-tests/FundingPips_Favorite_Card.png')
    console.log('Should show:')
    console.log('- Gray bubble (Previous): 20,250')
    console.log('- Blue bubble (Current): 21,781')
    console.log('- Green badge: +7.56%')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFavoriteCard()