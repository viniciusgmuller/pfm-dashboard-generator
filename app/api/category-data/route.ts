import { NextResponse } from 'next/server'
import { FirmData } from '@/types/dashboard'
import { DashboardCategory, globalConfig } from '@/lib/globalConfig'
import { readFileSync } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as DashboardCategory || 'prop-trading'
  
  try {
    const csvFileName = globalConfig.categories[category].csvFile
    const csvPath = path.join(process.cwd(), 'data', 'weekly', csvFileName)
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    const records = parse(csvContent, {
      columns: false,
      skip_empty_lines: true,
      from_line: 2, // Skip header row
    })

    const firmData: FirmData[] = records
      .filter((row: string[]) => row[0] && row[0].trim() !== '')
      .map((row: string[]) => {
        const parseMoney = (value: string): number => {
          return parseInt(value.replace(/[$,]/g, '')) || 0
        }

        const parsePercentage = (value: string): number => {
          return parseFloat(value.replace(/%/g, '')) || 0
        }

        const parseNumber = (value: string): number => {
          return parseInt(value.replace(/,/g, '')) || 0
        }

        return {
          firmName: row[0].trim(),
          previousPosition: parseNumber(row[1]),
          currentPosition: parseNumber(row[2]),
          revenuePrevious: parseMoney(row[3]),
          revenueCurrent: parseMoney(row[4]),
          revenueChange: parsePercentage(row[5]),
          visitsPinkPrevious: parseNumber(row[6]),
          visitsPinkCurrent: parseNumber(row[7]),
          favoritesAdded: parseNumber(row[8]),
          favoritesChange: parsePercentage(row[9]),
          visitsAzulPrevious: parseNumber(row[10]),
          trafficCurrent: parseNumber(row[11]),
          trafficIncrease: parsePercentage(row[12]),
          cfdShare: parsePercentage(row[13]),
        }
      })
    
    return NextResponse.json(firmData)
  } catch (error) {
    console.error('Error loading category data:', error)
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 })
  }
}