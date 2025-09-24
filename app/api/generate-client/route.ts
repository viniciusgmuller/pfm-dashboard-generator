import { NextRequest, NextResponse } from 'next/server'
import { getContextualRanking } from '@/lib/csv-utils'

export const maxDuration = 60 // 1 minute max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const csvContent = formData.get('csv') as string
    const currentWeek = formData.get('currentWeek') as string
    const totalVisits = formData.get('totalVisits') as string
    const category = formData.get('category') as string

    // Parse CSV content
    const { parseCSVContent } = await import('@/lib/csv-utils')
    const firms = parseCSVContent(csvContent)

    if (firms.length === 0) {
      return NextResponse.json({ error: 'No valid data in CSV' }, { status: 400 })
    }

    // Process all firms and prepare dashboard data
    const dashboardsData = firms.map(firm => {
      const competitors = getContextualRanking(firms, firm, 3, 1)

      return {
        firm,
        competitors,
        config: {
          currentWeek,
          totalVisits: parseInt(totalVisits),
          category
        }
      }
    })

    return NextResponse.json({
      success: true,
      dashboards: dashboardsData,
      total: dashboardsData.length
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      {
        error: 'Failed to process dashboards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}