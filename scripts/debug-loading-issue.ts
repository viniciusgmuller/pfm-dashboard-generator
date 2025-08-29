#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import path from 'path'

async function debugLoadingIssue() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const fundingPips = firms.find(f => f.firmName === 'FundingPips')!
    
    console.log('=== Debug Loading Issue ===')
    console.log('FundingPips data:')
    console.log(JSON.stringify(fundingPips, null, 2))
    
    const competitors = getContextualRanking(firms, fundingPips)
    console.log('\nCompetitors data:')
    console.log(JSON.stringify(competitors, null, 2))
    
    const browser = await puppeteer.launch({ headless: false, devtools: true }) // Launch with devtools
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    // Enable console logging
    page.on('console', msg => {
      console.log('BROWSER CONSOLE:', msg.type(), msg.text())
    })
    
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message)
    })
    
    const firmDataParam = encodeURIComponent(JSON.stringify(fundingPips))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/fundingpips?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('\n📸 Opening browser with devtools...')
    console.log('URL:', url)
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Wait a bit to see what happens
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const readyElement = await page.$('[data-ready="true"]')
    console.log('Ready element found:', !!readyElement)
    
    if (!readyElement) {
      const bodyText = await page.evaluate(() => document.body.innerText)
      console.log('Page content:', bodyText)
    }
    
    console.log('\nPress Ctrl+C to close...')
    await new Promise(resolve => setTimeout(resolve, 30000)) // Keep browser open for debugging
    
    await browser.close()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugLoadingIssue()