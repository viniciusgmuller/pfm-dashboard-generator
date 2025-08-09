#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// Test high resolution generation
async function testHighRes() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Test with just FTMO at 2x resolution
    const ftmo = firms.find(f => f.firmName === 'FTMO')
    if (!ftmo) return

    console.log('🚀 Starting server for high-res test...')
    const serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '3001' },
      stdio: 'pipe'
    })

    // Wait for server
    await new Promise(resolve => {
      serverProcess.stdout.on('data', (data) => {
        if (data.toString().includes('Ready')) {
          resolve(true)
        }
      })
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { 
        width: 1560, 
        height: 850,
        deviceScaleFactor: 2  // 2x resolution
      }
    })

    console.log('📸 Generating FTMO at 2x resolution...')
    
    const page = await browser.newPage()
    const competitors = getContextualRanking(firms, ftmo, 3, 1)
    
    const firmDataParam = encodeURIComponent(JSON.stringify(ftmo))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    const dashboardUrl = `http://localhost:3001/dashboard/${ftmo.firmName.replace(/\s+/g, '-').toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/high-res-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Regular resolution
    const screenshotPath1x = path.join(outputDir, 'FTMO_1x.png')
    await page.setViewport({ width: 1560, height: 850, deviceScaleFactor: 1 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await page.screenshot({ path: screenshotPath1x })
    
    // High resolution (2x)
    const screenshotPath2x = path.join(outputDir, 'FTMO_2x.png')
    await page.setViewport({ width: 1560, height: 850, deviceScaleFactor: 2 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await page.screenshot({ path: screenshotPath2x })
    
    await page.close()
    await browser.close()
    serverProcess.kill()
    
    // Check file sizes
    const stats1x = fs.statSync(screenshotPath1x)
    const stats2x = fs.statSync(screenshotPath2x)
    
    console.log(`✅ Regular (1x): ${screenshotPath1x} (${Math.round(stats1x.size / 1024)} KB)`)
    console.log(`✅ High-res (2x): ${screenshotPath2x} (${Math.round(stats2x.size / 1024)} KB)`)
    console.log(`🔍 Size difference: ${Math.round((stats2x.size / stats1x.size) * 100)}% larger`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testHighRes()