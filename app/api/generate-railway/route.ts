import { NextRequest, NextResponse } from 'next/server'
import { getContextualRanking } from '@/lib/csv-utils'

export const maxDuration = 300 // 5 minutes max

// Railway worker URL - will be set after deployment
const WORKER_URL = process.env.RAILWAY_WORKER_URL || 'http://localhost:3001'

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
          message: 'Connecting to Railway worker...'
        })

        // Check worker health
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)

          const healthResponse = await fetch(`${WORKER_URL}/health`, {
            method: 'GET',
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (!healthResponse.ok) {
            throw new Error('Worker is not healthy')
          }

          sendEvent({
            type: 'progress',
            completed: 0,
            total: firms.length,
            current: 'Worker connected successfully',
            message: 'Starting dashboard generation...'
          })
        } catch (error) {
          sendEvent({
            type: 'error',
            error: 'Worker connection failed',
            details: `Cannot connect to Railway worker at ${WORKER_URL}. Please check if the worker is deployed.`
          })
          controller.close()
          return
        }

        // Prepare dashboard data for the worker
        const dashboardsData = []

        for (const firm of firms) {
          // Get contextual ranking
          const competitors = getContextualRanking(firms, firm, 3, 1)

          // Create dashboard URL
          const firmSlug = firm.firmName.replace(/\s+/g, '-').toLowerCase()
          const firmDataParam = encodeURIComponent(JSON.stringify(firm))
          const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
          const configParam = encodeURIComponent(JSON.stringify({
            currentWeek,
            totalVisits: parseInt(totalVisits),
            category
          }))

          // Build full dashboard URL
          const dashboardUrl = `${request.nextUrl.origin}/dashboard/${firmSlug}?data=${firmDataParam}&competitors=${competitorsParam}&category=${category}&config=${configParam}`

          dashboardsData.push({
            dashboardUrl,
            firmName: firm.firmName,
            filename: `${firm.firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`,
            options: {
              width: 1560,
              height: 850,
              scale: scale
            }
          })
        }

        // Send batch request to Railway worker
        const workerResponse = await fetch(`${WORKER_URL}/generate-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dashboards: dashboardsData
          })
        })

        if (!workerResponse.ok) {
          throw new Error(`Worker responded with status: ${workerResponse.status}`)
        }

        // Stream the response from the worker
        const reader = workerResponse.body?.getReader()
        if (!reader) {
          throw new Error('Could not read worker response')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                sendEvent(data)
              } catch (error) {
                console.error('Error parsing worker SSE data:', error)
              }
            }
          }
        }

      } catch (error) {
        console.error('Railway generation error:', error)
        sendEvent({
          type: 'error',
          error: 'Failed to generate dashboards via Railway worker',
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