#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

async function testFTMO() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const ftmo = firms.find(f => f.firmName === 'FTMO')
    if (!ftmo) {
      console.error('FTMO not found')
      return
    }

    console.log('=== FTMO Data Check ===')
    console.log(`Firm: ${ftmo.firmName}`)
    console.log(`Position: ${ftmo.currentPosition}`)
    console.log(`Revenue: $${ftmo.revenueCurrent.toLocaleString()}`)
    console.log(`Favorites (Col H): ${ftmo.visitsPinkCurrent}`)
    console.log(`Traffic % (Col N): ${ftmo.cfdShare}%`)
    console.log('')

    console.log('🚀 Starting server...')
    const serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '3001' },
      stdio: 'pipe'
    })

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
      defaultViewport: { width: 1560, height: 850 }
    })

    console.log('📸 Generating FTMO dashboard...')
    
    const page = await browser.newPage()
    const competitors = getContextualRanking(firms, ftmo, 3, 1)
    
    const firmDataParam = encodeURIComponent(JSON.stringify(ftmo))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    const dashboardUrl = `http://localhost:3001/dashboard/${ftmo.firmName.replace(/\s+/g, '-').toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log(`Dashboard URL: ${dashboardUrl}`)
    
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const outputDir = './output/data-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const screenshotPath = path.join(outputDir, 'FTMO_data_test.png')
    await page.screenshot({ path: screenshotPath })
    
    console.log(`✅ FTMO dashboard saved: ${screenshotPath}`)
    console.log(`Expected to see: Favorites=${ftmo.visitsPinkCurrent}, Visits=${ftmo.cfdShare}%`)
    
    await page.close()
    await browser.close()
    serverProcess.kill()
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFTMO()