#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import { FirmData } from './types'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// Quick test with just 3 firms
async function generateSampleDashboards() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    // Test with just these 3 firms
    const testFirms = ['FTMO', 'E8 Markets', 'The5ers']
    
    console.log('🚀 Starting server...')
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
    
    console.log('✅ Server ready!')
    await new Promise(resolve => setTimeout(resolve, 2000))

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1560, height: 850 }
    })

    for (const firmName of testFirms) {
      const firm = firms.find(f => f.firmName === firmName)
      if (!firm) continue

      console.log(`📸 Generating ${firmName}...`)
      
      const page = await browser.newPage()
      const competitors = getContextualRanking(firms, firm, 3, 1)
      
      const firmDataParam = encodeURIComponent(JSON.stringify(firm))
      const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
      const dashboardUrl = `http://localhost:3001/dashboard/${firm.firmName.replace(/\s+/g, '-').toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
      
      await page.goto(dashboardUrl, { waitUntil: 'networkidle2' })
      await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const outputDir = './output/sample-test'
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      
      const screenshotPath = path.join(outputDir, `${firm.firmName.replace(/\s+/g, '_')}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false })
      
      console.log(`✅ ${firmName} saved!`)
      await page.close()
    }

    await browser.close()
    serverProcess.kill()
    console.log('🎉 Sample generation complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

generateSampleDashboards()