#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testThe5ersRanking() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const the5ers = firms.find(f => f.firmName === 'The5ers')!
    
    console.log('=== The5ers Ranking Test ===')
    console.log(`Previous Position (B): ${the5ers.previousPosition}`)
    console.log(`Current Position (C): ${the5ers.currentPosition}`)
    console.log(`Direction: Up +${the5ers.previousPosition - the5ers.currentPosition}`)
    console.log(`Should show: 3rd → 1st with UP arrows`)
    
    const competitors = getContextualRanking(firms, the5ers)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(the5ers))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/the5ers?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Testing The5ers ranking with real CSV data...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/ranking-tests'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'The5ers_Ranking_Up.png') })
    
    console.log('✅ Screenshot saved: output/ranking-tests/The5ers_Ranking_Up.png')
    console.log('Should show:')
    console.log('- Gray pill: 3rd (previous)')
    console.log('- Blue pill: 2nd (current)')  
    console.log('- Green up arrows and +1 badge')
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testThe5ersRanking()