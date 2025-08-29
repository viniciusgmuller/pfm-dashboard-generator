import { FirmData } from '@/types/dashboard'
import { DashboardCategory } from './globalConfig'
import { parse } from 'csv-parse/sync'

export function parseCSVContent(csvContent: string): FirmData[] {
  const records = parse(csvContent, {
    columns: false,
    skip_empty_lines: true,
    from_line: 2, // Skip header row
  })

  return records
    .filter((row: string[]) => row[0] && row[0].trim() !== '')
    .map((row: string[]) => {
      const parseMoney = (value: string): number => {
        if (!value || value === '-' || value === 'N/A') return 0
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
}

export async function loadCategoryData(category: DashboardCategory = 'prop-trading'): Promise<FirmData[]> {
  try {
    const response = await fetch(`/api/category-data?category=${category}`)
    if (!response.ok) {
      throw new Error('Failed to fetch category data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error loading category data:', error)
    return []
  }
}

export function getContextualRanking(
  firms: FirmData[],
  targetFirm: FirmData,
  positionsAbove: number = 3,
  positionsBelow: number = 1
): FirmData[] {
  // If target firm has invalid position, just return it with some competitors
  if (targetFirm.currentPosition <= 0) {
    const validFirms = [...firms]
      .filter(f => f.currentPosition > 0)
      .sort((a, b) => a.currentPosition - b.currentPosition)
      .slice(0, 5) // Get top 5 firms
    
    return [targetFirm, ...validFirms.slice(0, 4)].slice(0, 5)
  }

  const validFirms = [...firms]
    .filter(f => f.currentPosition > 0)
    .sort((a, b) => a.currentPosition - b.currentPosition)
  
  const targetIndex = validFirms.findIndex(f => f.firmName === targetFirm.firmName)
  
  if (targetIndex === -1) {
    // If target firm not in valid firms, add it and return with context
    const allFirms = [targetFirm, ...validFirms]
      .sort((a, b) => a.currentPosition - b.currentPosition)
    return allFirms.slice(0, 5)
  }
  
  const targetPosition = targetFirm.currentPosition
  const totalValidFirms = validFirms.length
  
  let actualPositionsAbove: number
  let actualPositionsBelow: number
  
  if (targetPosition === 1) {
    actualPositionsAbove = 0
    actualPositionsBelow = Math.min(4, totalValidFirms - targetIndex - 1)
  } else if (targetPosition === 2) {
    actualPositionsAbove = 1
    actualPositionsBelow = Math.min(3, totalValidFirms - targetIndex - 1)
  } else if (targetPosition === 3) {
    actualPositionsAbove = 2
    actualPositionsBelow = Math.min(2, totalValidFirms - targetIndex - 1)
  } else if (targetIndex >= totalValidFirms - 2) {
    actualPositionsAbove = Math.min(4, targetIndex)
    actualPositionsBelow = Math.min(1, totalValidFirms - targetIndex - 1)
  } else {
    actualPositionsAbove = Math.min(positionsAbove, targetIndex)
    actualPositionsBelow = Math.min(positionsBelow, totalValidFirms - targetIndex - 1)
  }
  
  const startIndex = Math.max(0, targetIndex - actualPositionsAbove)
  const endIndex = Math.min(validFirms.length - 1, targetIndex + actualPositionsBelow)
  
  return validFirms.slice(startIndex, endIndex + 1)
}