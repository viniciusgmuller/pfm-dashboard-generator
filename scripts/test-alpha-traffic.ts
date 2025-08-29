#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function testAlphaTraffic() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const alpha = firms.find(f => f.firmName === 'Alpha Capital')!
    
    console.log('=== Alpha Capital Traffic Data ===')
    console.log(`Previous Week (K): ${alpha.visitsAzulPrevious}`)
    console.log(`Current Week (L): ${alpha.trafficCurrent}`)
    console.log(`CFD Share (N): ${alpha.cfdShare}%`)
    console.log('')

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const competitors = getContextualRanking(firms, alpha, 3, 1)
    const firmDataParam = encodeURIComponent(JSON.stringify(alpha))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/${alpha.firmName.toLowerCase().replace(' ', '-')}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking Alpha Capital screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/data-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'Alpha_Capital_traffic_test.png') })
    
    console.log('✅ Screenshot saved: output/data-test/Alpha_Capital_traffic_test.png')
    console.log(`Expected TrafficCard values:`)
    console.log(`- Previous Week (gray bar): ${alpha.visitsAzulPrevious}`)
    console.log(`- Current Week (blue bar): ${alpha.trafficCurrent}`)
    console.log(`- CFD Share pie: ${alpha.cfdShare}%`)
    
    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAlphaTraffic()