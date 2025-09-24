import { NextRequest, NextResponse } from 'next/server'
import { DashboardCategory, globalConfig } from '@/lib/globalConfig'
import { readFileSync } from 'fs'
import path from 'path'
import { parseCSVContent } from '@/lib/csv-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = (searchParams.get('category') || 'prop-trading') as DashboardCategory
    
    // Validate category
    if (!globalConfig.categories[category]) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }
    
    const csvFileName = globalConfig.categories[category].csvFile
    const csvPath = path.join(process.cwd(), 'data', 'weekly', csvFileName)
    
    try {
      const csvContent = readFileSync(csvPath, 'utf-8')
      const data = parseCSVContent(csvContent)
      
      return NextResponse.json({
        category,
        categoryName: globalConfig.categories[category].name,
        visitors: globalConfig.categories[category].visitors,
        data
      })
    } catch (fileError) {
      console.error(`Error reading ${csvFileName}:`, fileError)
      return NextResponse.json({ error: 'Failed to read data file' }, { status: 500 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}