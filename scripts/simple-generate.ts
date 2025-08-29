#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { parseCSVContent, getContextualRanking } from '../lib/csv-utils'

// Parse command line arguments
const args = process.argv.slice(2)
let inputFile = 'data/weekly/data.csv'
let outputDir = './output/dashboards'
let scale = 1

// Simple argument parsing
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) {
    inputFile = args[i + 1]
    i++
  }
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[i + 1]
    i++
  }
  if (args[i] === '--scale' && args[i + 1]) {
    scale = parseFloat(args[i + 1])
    i++
  }
}

// Auto-detect if this is futures data and adjust output directory
if (inputFile.includes('datafutures') && !args.includes('--output')) {
  outputDir = './output/futures'
}

async function generateDashboards() {
  console.log('🚀 Starting Dashboard Generation...')
  console.log(`📊 Input file: ${inputFile}`)
  console.log(`📁 Output directory: ${outputDir}`)
  console.log(`🔍 Scale factor: ${scale}x`)
  
  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
    console.log(`✅ Created output directory: ${outputDir}`)
  }
  
  // Load CSV data
  try {
    const csvPath = path.join(process.cwd(), inputFile)
    const csvContent = readFileSync(csvPath, 'utf-8')
    const firms = parseCSVContent(csvContent)
    
    console.log(`📈 Loaded ${firms.length} firms from CSV`)
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode (completely invisible)
      defaultViewport: {
        width: 1560,
        height: 850,
        deviceScaleFactor: scale
      },
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--run-all-compositor-stages-before-draw',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--window-size=1560,850',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ]
    })
    
    let successCount = 0
    let failedFirms: string[] = []
    
    // Process each firm
    for (let i = 0; i < firms.length; i++) {
      const firm = firms[i]
      console.log(`\n[${i + 1}/${firms.length}] Processing: ${firm.firmName}`)
      
      try {
        // Get contextual ranking
        const competitors = getContextualRanking(firms, firm, 3, 1)
        
        // Create URL parameters
        const firmDataParam = encodeURIComponent(JSON.stringify(firm))
        const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
        
        // Determine category based on input file
        const category = inputFile.includes('datafutures') ? 'futures' : 'prop-trading'
        
        // Build dashboard URL
        const firmSlug = firm.firmName.replace(/\s+/g, '-').toLowerCase()
        const dashboardUrl = `http://localhost:3000/dashboard/${firmSlug}?data=${firmDataParam}&competitors=${competitorsParam}&category=${category}`
        
        console.log(`  🌐 Opening: ${dashboardUrl}`)
        
        // Create new page
        const page = await browser.newPage()
        
        // Set a realistic User-Agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        // Navigate to dashboard
        await page.goto(dashboardUrl, { 
          waitUntil: 'networkidle0',
          timeout: 60000 
        })
        
        // Check for JavaScript errors
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.log(`  🐛 Console error: ${msg.text()}`)
          }
        })
        
        // Wait for the dashboard to be ready
        console.log(`  ⏳ Waiting for dashboard to load...`)
        
        // Debug: Check if body exists and what data-ready value is
        const bodyExists = await page.evaluate(() => {
          const hasBody = !!document.body
          const dataReady = document.body?.getAttribute('data-ready') || 'not set'
          console.log('Body exists:', hasBody, 'data-ready:', dataReady)
          return { hasBody, dataReady }
        })
        console.log(`  🔍 Debug: Body exists: ${bodyExists.hasBody}, data-ready: ${bodyExists.dataReady}`)
        
        // Try waiting with a simpler approach first
        try {
          await page.waitForFunction(() => {
            return document.body && document.body.getAttribute('data-ready') === 'true'
          }, { timeout: 30000 })
        } catch (timeoutError) {
          // If timeout, try to get more debug info
          const finalCheck = await page.evaluate(() => {
            return {
              bodyExists: !!document.body,
              dataReady: document.body?.getAttribute('data-ready'),
              title: document.title,
              url: window.location.href
            }
          })
          console.log(`  🚨 Timeout debug info:`, finalCheck)
          throw timeoutError
        }
        
        // Additional wait for animations and styling
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Take screenshot
        const filename = `${firm.firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`
        const screenshotPath = path.join(outputDir, filename)
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
          type: 'png',
          omitBackground: false
        })
        
        console.log(`  ✅ Saved: ${screenshotPath}`)
        successCount++
        
        // Close page
        await page.close()
        
        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error}`)
        failedFirms.push(firm.firmName)
        
        // Try to close page if it exists
        try {
          const pages = await browser.pages()
          if (pages.length > 1) {
            await pages[pages.length - 1].close()
          }
        } catch {}
      }
    }
    
    // Close browser
    await browser.close()
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 DASHBOARD GENERATION COMPLETE')
    console.log('='.repeat(50))
    console.log(`✅ Successfully generated: ${successCount}/${firms.length} dashboards`)
    console.log(`📁 Output directory: ${outputDir}`)
    
    if (failedFirms.length > 0) {
      console.log(`\n❌ Failed firms (${failedFirms.length}):`)
      failedFirms.forEach(name => console.log(`  - ${name}`))
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000')
    return true
  } catch {
    return false
  }
}

// Main execution
async function main() {
  // Check if Next.js server is running
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.error('❌ Next.js server is not running!')
    console.log('Please start the server first with: npm run dev')
    process.exit(1)
  }
  
  console.log('✅ Next.js server is running')
  
  // Start generation
  await generateDashboards()
}

main().catch(console.error)