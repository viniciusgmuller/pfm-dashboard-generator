#!/usr/bin/env node

import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import { FirmData, GenerationOptions } from './types'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { Command } from 'commander'

// Function to start Next.js dev server
async function startNextServer(port: number = 3000): Promise<() => void> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Next.js server...')
    
    const serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: port.toString() },
      stdio: 'pipe'
    })

    let serverReady = false

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString()
      if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
        if (!serverReady) {
          serverReady = true
          console.log('✅ Next.js server is ready!')
          
          // Return cleanup function
          resolve(() => {
            console.log('🛑 Shutting down Next.js server...')
            serverProcess.kill()
          })
        }
      }
    })

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`)
    })

    serverProcess.on('error', (error) => {
      reject(error)
    })

    // Timeout if server doesn't start
    setTimeout(() => {
      if (!serverReady) {
        serverProcess.kill()
        reject(new Error('Server failed to start within timeout'))
      }
    }, 30000)
  })
}

// Function to wait for element
async function waitForElement(page: any, selector: string, timeout: number = 30000) {
  try {
    await page.waitForSelector(selector, { timeout })
    return true
  } catch {
    return false
  }
}

// Main generation function
async function generateDashboard(
  firm: FirmData,
  competitors: FirmData[],
  outputPath: string,
  serverUrl: string,
  options: { width: number; height: number; scale?: number; quality?: number }
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.scale || 1
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    
    // Prepare data for URL parameters
    const firmDataParam = encodeURIComponent(JSON.stringify(firm))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    // Navigate to dashboard page
    const dashboardUrl = `${serverUrl}/dashboard/${firm.firmName.replace(/\s+/g, '-').toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log(`📸 Generating dashboard for ${firm.firmName}...`)
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' })
    
    // Wait for dashboard to be ready
    await page.waitForSelector('[data-ready="true"]', { timeout: 30000 })
    
    // Additional wait for animations
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Take screenshot
    const screenshotPath = path.join(outputPath, `${firm.firmName.replace(/\s+/g, '_')}.png`)
    const screenshotOptions: any = {
      path: screenshotPath,
      fullPage: false
    }
    
    // Only add quality for JPEG format
    if (screenshotPath.endsWith('.jpg') || screenshotPath.endsWith('.jpeg')) {
      screenshotOptions.quality = options.quality || 90
    }
    
    await page.screenshot(screenshotOptions)
    
    console.log(`✅ Dashboard saved: ${screenshotPath}`)
  } finally {
    await browser.close()
  }
}

// Main execution
async function main(options: GenerationOptions) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true })
    }

    // Parse CSV file
    console.log(`📊 Reading CSV file: ${options.inputFile}`)
    const firms = parseCSV(options.inputFile)
    console.log(`Found ${firms.length} firms in CSV`)

    // Start Next.js server
    const serverPort = 3001
    const serverUrl = options.serverUrl || `http://localhost:${serverPort}`
    const stopServer = await startNextServer(serverPort)

    try {
      // Wait a bit for server to stabilize
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate dashboard for each firm
      for (const firm of firms) {
        // Get contextual ranking (3 above, 1 below)
        const contextualCompetitors = getContextualRanking(firms, firm, 3, 1)
        
        await generateDashboard(
          firm,
          contextualCompetitors,
          options.outputDir,
          serverUrl,
          {
            width: options.width || 1560,
            height: options.height || 850,
            scale: options.scale || 1,
            quality: options.quality
          }
        )
      }

      console.log(`🎉 Successfully generated ${firms.length} dashboards!`)
    } finally {
      // Stop the server
      stopServer()
    }
  } catch (error) {
    console.error('❌ Error generating dashboards:', error)
    process.exit(1)
  }
}

// CLI setup
const program = new Command()

program
  .name('generate-dashboards')
  .description('Generate dashboard PNGs from CSV data')
  .version('1.0.0')
  .requiredOption('-i, --input <file>', 'Input CSV file path')
  .option('-o, --output <dir>', 'Output directory for PNGs', './output/dashboards')
  .option('-s, --server <url>', 'Next.js server URL')
  .option('-w, --width <number>', 'Dashboard width in pixels', '1560')
  .option('--height <number>', 'Dashboard height in pixels', '850')
  .option('--scale <number>', 'Image scale factor (1x, 2x, 3x)', '1')
  .option('-q, --quality <number>', 'Image quality for JPEG (1-100)', '90')
  .option('-f, --format <type>', 'Output format (png|pdf|jpeg)', 'png')
  .action((options) => {
    const generationOptions: GenerationOptions = {
      inputFile: options.input,
      outputDir: options.output,
      serverUrl: options.server,
      width: parseInt(options.width),
      height: parseInt(options.height),
      scale: parseFloat(options.scale),
      quality: parseInt(options.quality),
      format: options.format
    }
    
    console.log(`📸 Generating dashboards at ${generationOptions.scale}x scale...`)
    if (generationOptions.scale > 1) {
      console.log(`🔍 High resolution mode: ${generationOptions.width * generationOptions.scale}x${generationOptions.height * generationOptions.scale} pixels`)
    }
    
    main(generationOptions)
  })

program.parse()

// Export for programmatic use
export { generateDashboard, main }