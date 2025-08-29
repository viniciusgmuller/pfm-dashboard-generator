#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testE8RankingDown() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const e8Markets = firms.find(f => f.firmName === 'E8 Markets')!
    
    console.log('=== E8 Markets Ranking Test (Down) ===')
    console.log(`Previous Position (B): ${e8Markets.previousPosition}`)
    console.log(`Current Position (C): ${e8Markets.currentPosition}`)
    console.log(`Direction: Down -${e8Markets.currentPosition - e8Markets.previousPosition}`)
    console.log(`Should show: 2nd → 3rd with DOWN arrows`)
    
    const competitors = getContextualRanking(firms, e8Markets)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(e8Markets))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/e8-markets?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing E8 Markets ranking with negative change...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/ranking-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'E8_Markets_Ranking_Down.png') })
    
    console.log('✅ Screenshot saved: output/ranking-tests/E8_Markets_Ranking_Down.png')
    console.log('Should show:')
    console.log('- Gray pill: 2nd (previous)')
    console.log('- Blue pill: 3rd (current)')  
    console.log('- Red down arrows and -1 badge')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testE8RankingDown()