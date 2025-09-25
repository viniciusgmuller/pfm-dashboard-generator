import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { dashboardUrl, firmName } = await request.json()

    if (!dashboardUrl || !firmName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use puppeteer-core with chromium for Vercel
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1560, height: 850 },
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    const page = await browser.newPage()

    // Set viewport
    await page.setViewport({ width: 1560, height: 850, deviceScaleFactor: 2 })

    // Navigate to dashboard
    await page.goto(dashboardUrl, { waitUntil: 'networkidle0', timeout: 60000 })

    // Wait for dashboard to be ready
    await page.waitForFunction(() => {
      return document.body && (
        document.body.getAttribute('data-ready') === 'true' ||
        document.querySelector('[data-ready="true"]') ||
        document.readyState === 'complete'
      )
    }, { timeout: 30000 })

    // Wait a bit for animations
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage: false,
      type: 'png',
      quality: 95
    })

    await browser.close()

    // Convert to base64
    const base64 = screenshot.toString('base64')

    return NextResponse.json({
      success: true,
      firmName,
      filename: `${firmName.replace(/\s+/g, '_')}.png`,
      data: base64
    })

  } catch (error) {
    console.error('Screenshot error:', error)
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    )
  }
}