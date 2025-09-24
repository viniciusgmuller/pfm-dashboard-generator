import { NextRequest, NextResponse } from 'next/server'
import { getContextualRanking } from '@/lib/csv-utils'

export const maxDuration = 300 // 5 minutes max
export const runtime = 'edge' // Use Edge Runtime for better performance

// Helper function to generate dashboard HTML as data URL
async function generateDashboardImage(
  firm: any,
  competitors: any[],
  config: any
): Promise<string> {
  try {
    // Build the dashboard URL
    const firmSlug = firm.firmName.replace(/\s+/g, '-').toLowerCase()
    const firmDataParam = encodeURIComponent(JSON.stringify(firm))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    const configParam = encodeURIComponent(JSON.stringify(config))

    // Use the actual domain in production, localhost in development
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const dashboardUrl = `${baseUrl}/dashboard/${firmSlug}?data=${firmDataParam}&competitors=${competitorsParam}&category=${config.category}&config=${configParam}`

    // Fetch the HTML content
    const response = await fetch(dashboardUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.status}`)
    }

    const html = await response.text()

    // For now, we'll return a placeholder since we can't use Puppeteer
    // In production, we should use a different approach
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  } catch (error) {
    console.error(`Error generating dashboard for ${firm.firmName}:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const formData = await request.formData()
        const csvContent = formData.get('csv') as string
        const currentWeek = formData.get('currentWeek') as string
        const totalVisits = formData.get('totalVisits') as string
        const category = formData.get('category') as string
        const scale = parseInt(formData.get('scale') as string) || 2

        // Parse CSV content
        const { parseCSVContent } = await import('@/lib/csv-utils')
        const firms = parseCSVContent(csvContent)

        if (firms.length === 0) {
          sendEvent({ error: 'No valid data in CSV' })
          controller.close()
          return
        }

        // Send initial progress
        sendEvent({
          type: 'start',
          total: firms.length,
          message: 'Starting dashboard generation...'
        })

        const dashboards = []
        let completed = 0

        // Process each firm
        for (let index = 0; index < firms.length; index++) {
          const firm = firms[index]

          try {
            // Send progress update
            sendEvent({
              type: 'progress',
              completed,
              total: firms.length,
              current: firm.firmName,
              message: `Processing ${firm.firmName} (${completed + 1}/${firms.length})...`
            })

            // Get contextual ranking
            const competitors = getContextualRanking(firms, firm, 3, 1)

            // Configuration
            const config = {
              currentWeek,
              totalVisits: parseInt(totalVisits),
              category
            }

            // For Vercel deployment, we need a different approach
            // Since we can't use Puppeteer, we'll use a simpler method
            // This is a temporary solution - in production you might want to use
            // a service like Browserless or Puppeteer on a separate server

            // Generate a placeholder image for now
            const imageData = await generateDashboardImage(firm, competitors, config)

            // Extract base64 from data URL
            const base64 = imageData.split(',')[1] || ''

            const dashboard = {
              firmName: firm.firmName,
              filename: `${firm.firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`,
              data: base64
            }

            dashboards.push(dashboard)
            completed++

            // Send individual dashboard completion
            sendEvent({
              type: 'dashboard',
              dashboard,
              completed,
              total: firms.length
            })

            // Small delay between generations
            await new Promise(resolve => setTimeout(resolve, 100))

          } catch (error) {
            console.error(`Error processing ${firm.firmName}:`, error)
            sendEvent({
              type: 'error',
              firm: firm.firmName,
              message: `Failed to generate dashboard for ${firm.firmName}`
            })
          }
        }

        // Send completion event
        sendEvent({
          type: 'complete',
          success: true,
          dashboards,
          total: dashboards.length,
          message: `Successfully processed ${dashboards.length} dashboards!`
        })

      } catch (error) {
        console.error('Generation error:', error)
        sendEvent({
          type: 'error',
          error: 'Failed to generate dashboards',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}