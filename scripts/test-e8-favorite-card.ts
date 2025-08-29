#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testE8FavoriteCard() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')!
    
    console.log('=== E8 Markets Favorite Card Test ===')
    console.log(`Previous Week (G): ${e8Markets.visitsPinkPrevious.toLocaleString()}`)
    console.log(`Current Week (H): ${e8Markets.visitsPinkCurrent.toLocaleString()}`)
    console.log(`Favorites Added (I): ${e8Markets.favoritesAdded.toLocaleString()}`)
    console.log(`Expected change: +2.54%`)
    
    const competitors = getContextualRanking(firms, e8Markets)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(e8Markets))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/e8-markets?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing E8 Markets FavoriteCard...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/favorite-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'E8_Markets_Favorite_Card.png') })
    
    console.log('✅ Screenshot saved: output/favorite-tests/E8_Markets_Favorite_Card.png')
    console.log('Should show:')
    console.log('- Gray bubble (Previous): 3,972 (smaller)')
    console.log('- Blue bubble (Current): 4,073 (slightly larger)')  
    console.log('- Green badge: +2.54%')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testE8FavoriteCard()