import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { getContextualRanking } from '@/lib/csv-utils'

export const maxDuration = 300 // 5 minutes max

export async function POST(request: NextRequest) {
  let browser = null

  try {
    const formData = await request.formData()
    const csvContent = formData.get('csv') as string
    const currentWeek = formData.get('currentWeek') as string
    const totalVisits = formData.get('totalVisits') as string
    const category = formData.get('category') as string
    const scale = parseInt(formData.get('scale') as string) || 2

    // Parse CSV content (reuse existing parser)
    const { parseCSVContent } = await import('@/lib/csv-utils')
    const firms = parseCSVContent(csvContent)

    if (firms.length === 0) {
      return NextResponse.json({ error: 'No valid data in CSV' }, { status: 400 })
    }

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
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
        '--window-size=1560,850'
      ]
    })

    const dashboards = []

    // Process each firm
    for (const firm of firms) {
      try {
        // Get contextual ranking
        const competitors = getContextualRanking(firms, firm, 3, 1)

        // Create URL parameters
        const firmDataParam = encodeURIComponent(JSON.stringify(firm))
        const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
        const configParam = encodeURIComponent(JSON.stringify({
          currentWeek,
          totalVisits: parseInt(totalVisits),
          category
        }))

        // Build dashboard URL
        const firmSlug = firm.firmName.replace(/\s+/g, '-').toLowerCase()
        const dashboardUrl = `${request.nextUrl.origin}/dashboard/${firmSlug}?data=${firmDataParam}&competitors=${competitorsParam}&category=${category}&config=${configParam}`

        // Create new page
        const page = await browser.newPage()

        // Navigate to dashboard
        await page.goto(dashboardUrl, {
          waitUntil: 'networkidle0',
          timeout: 60000
        })

        // Wait for dashboard to be ready
        await page.waitForFunction(() => {
          return document.body && document.body.getAttribute('data-ready') === 'true'
        }, { timeout: 30000 })

        // Additional wait for animations
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Take screenshot
        const screenshot = await page.screenshot({
          fullPage: false,
          type: 'png',
          omitBackground: false
        })

        // Convert to base64
        const base64 = screenshot.toString('base64')

        dashboards.push({
          firmName: firm.firmName,
          filename: `${firm.firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`,
          data: base64
        })

        await page.close()

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing ${firm.firmName}:`, error)
      }
    }

    await browser.close()

    return NextResponse.json({
      success: true,
      dashboards,
      total: dashboards.length
    })

  } catch (error) {
    if (browser) await browser.close()
    console.error('Generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate dashboards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}