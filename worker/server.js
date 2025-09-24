import express from 'express'
import puppeteer from 'puppeteer'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['https://pfm-insights-d0uvkk38f-viniciusgmuller-3964s-projects.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'Worker running',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Screenshot generation endpoint
app.post('/generate-screenshot', async (req, res) => {
  const startTime = Date.now()
  let browser = null

  try {
    const { dashboardUrl, firmName, filename, options = {} } = req.body

    if (!dashboardUrl || !firmName) {
      return res.status(400).json({
        error: 'Missing required fields: dashboardUrl, firmName'
      })
    }

    console.log(`🚀 Starting screenshot generation for: ${firmName}`)
    console.log(`📍 URL: ${dashboardUrl}`)

    // Launch browser with optimized settings for Railway
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
      defaultViewport: {
        width: options.width || 1560,
        height: options.height || 850,
        deviceScaleFactor: options.scale || 2
      }
    })

    const page = await browser.newPage()

    // Set timeout and wait settings
    page.setDefaultNavigationTimeout(60000)
    page.setDefaultTimeout(30000)

    // Navigate to dashboard
    console.log(`📂 Loading page...`)
    await page.goto(dashboardUrl, {
      waitUntil: 'networkidle0',
      timeout: 60000
    })

    // Wait for dashboard to be ready
    console.log(`⏳ Waiting for dashboard to render...`)
    await page.waitForFunction(() => {
      return document.body && (
        document.body.getAttribute('data-ready') === 'true' ||
        document.querySelector('[data-ready="true"]') ||
        document.readyState === 'complete'
      )
    }, { timeout: 30000 })

    // Additional wait for animations and rendering
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Take screenshot
    console.log(`📸 Taking screenshot...`)
    const screenshot = await page.screenshot({
      fullPage: false,
      type: 'png',
      omitBackground: false,
      quality: 95
    })

    // Convert to base64
    const base64 = screenshot.toString('base64')

    await browser.close()
    browser = null

    const processingTime = Date.now() - startTime
    console.log(`✅ Screenshot completed for ${firmName} in ${processingTime}ms`)

    res.json({
      success: true,
      firmName,
      filename: filename || `${firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`,
      data: base64,
      processingTime,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Screenshot generation failed:', error)

    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Failed to close browser:', closeError)
      }
    }

    const processingTime = Date.now() - startTime

    res.status(500).json({
      success: false,
      error: 'Screenshot generation failed',
      details: error.message,
      firmName: req.body.firmName || 'Unknown',
      processingTime,
      timestamp: new Date().toISOString()
    })
  }
})

// Batch screenshot generation
app.post('/generate-batch', async (req, res) => {
  const { dashboards } = req.body

  if (!dashboards || !Array.isArray(dashboards)) {
    return res.status(400).json({ error: 'Invalid dashboards array' })
  }

  // Set up SSE response
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    sendEvent({
      type: 'start',
      total: dashboards.length,
      message: 'Starting batch screenshot generation...'
    })

    const results = []

    for (let i = 0; i < dashboards.length; i++) {
      const dashboard = dashboards[i]

      try {
        sendEvent({
          type: 'progress',
          completed: i,
          total: dashboards.length,
          current: dashboard.firmName,
          message: `Generating screenshot for ${dashboard.firmName} (${i + 1}/${dashboards.length})...`
        })

        // Generate individual screenshot
        const screenshotResponse = await fetch(`${req.protocol}://${req.get('host')}/generate-screenshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dashboard)
        })

        const result = await screenshotResponse.json()

        if (result.success) {
          results.push(result)
          sendEvent({
            type: 'dashboard',
            dashboard: result,
            completed: i + 1,
            total: dashboards.length
          })
        } else {
          sendEvent({
            type: 'error',
            firm: dashboard.firmName,
            message: `Failed to generate screenshot for ${dashboard.firmName}`
          })
        }

      } catch (error) {
        console.error(`Error generating screenshot for ${dashboard.firmName}:`, error)
        sendEvent({
          type: 'error',
          firm: dashboard.firmName,
          message: `Failed to generate screenshot for ${dashboard.firmName}`
        })
      }

      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    sendEvent({
      type: 'complete',
      success: true,
      dashboards: results,
      total: results.length,
      message: `Successfully generated ${results.length} screenshots!`
    })

  } catch (error) {
    console.error('Batch generation error:', error)
    sendEvent({
      type: 'error',
      error: 'Batch generation failed',
      details: error.message
    })
  } finally {
    res.end()
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  })
})

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Dashboard Worker running on port ${port}`)
  console.log(`🌐 Health check: http://localhost:${port}/health`)
  console.log(`📸 Screenshot endpoint: http://localhost:${port}/generate-screenshot`)
  console.log(`📦 Batch endpoint: http://localhost:${port}/generate-batch`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully')
  process.exit(0)
})