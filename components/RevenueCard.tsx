"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

interface RevenueCardProps {
  previousWeek?: number
  currentWeek?: number
  isStatic?: boolean
}

const RevenueCard: React.FC<RevenueCardProps> = ({ 
  previousWeek, 
  currentWeek, 
  isStatic = false 
}) => {
  const [currentWeekRevenue, setCurrentWeekRevenue] = useState(currentWeek ?? 151280)
  const [previousWeekRevenue, setPreviousWeekRevenue] = useState(previousWeek ?? 165650)
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [editingPrevious, setEditingPrevious] = useState(false)
  
  // Calculate percentage change: ((current - previous) / previous) * 100
  const changePercentage = previousWeekRevenue === 0 
    ? (currentWeekRevenue > 0 ? 100 : 0) 
    : ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
  
  const formatCurrency = (amount: number): string => {
    return `$${new Intl.NumberFormat('en-US').format(amount)}`
  }

  const handleCurrentEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setCurrentWeekRevenue(numValue)
  }

  const handlePreviousEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setPreviousWeekRevenue(numValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean, setEditing: (value: boolean) => void) => {
    if (e.key === 'Enter') {
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  // Calculate percentage widths for bars (relative to the highest value)
  const maxValue = Math.max(currentWeekRevenue, previousWeekRevenue, 1) // Avoid division by zero
  const currentWeekWidth = (currentWeekRevenue / maxValue) * 100
  const previousWeekWidth = (previousWeekRevenue / maxValue) * 100

  return (
    <Card 
      className="h-full flex flex-col rounded-[10px] p-5 gap-5"
      style={{ 
        background: 'linear-gradient(138.51deg, #13192B 3.04%, #1F182B 97.61%)',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      <CardHeader className="pb-0 px-0 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Revenue Generated</span>
          </div>
          <Badge className={`flex items-center gap-1 ${
            changePercentage >= 0 ? 'bg-green-600' : 'bg-red-600'
          } text-white`}>
            {changePercentage >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(changePercentage).toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-0 flex-1 flex flex-col">
        {/* Separator Line */}
        <div className="w-full h-px bg-gray-600/30 mb-4"></div>
        <div className="flex-1 flex flex-col justify-center gap-6 px-4">
          {/* Current Week Bar */}
          <div className="relative h-12 bg-gray-800/50 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-lg flex items-center pl-4 transition-all duration-1000 ease-out"
              style={{ width: `${currentWeekWidth}%` }}
            >
              {editingCurrent && !isStatic ? (
                <input
                  type="text"
                  value={formatCurrency(currentWeekRevenue)}
                  onChange={(e) => handleCurrentEdit(e.target.value)}
                  onBlur={() => setEditingCurrent(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingCurrent, setEditingCurrent)}
                  className="bg-transparent text-white font-bold text-lg outline-none border-none w-32"
                  autoFocus
                />
              ) : (
                <span 
                  className={isStatic 
                    ? "text-white font-bold text-lg px-2 py-1"
                    : "text-white font-bold text-lg cursor-pointer hover:bg-blue-700/50 px-2 py-1 rounded transition-colors"
                  }
                  onClick={isStatic ? undefined : () => setEditingCurrent(true)}
                  title={isStatic ? undefined : "Click to edit"}
                >
                  {formatCurrency(currentWeekRevenue)}
                </span>
              )}
            </div>
          </div>

          {/* Previous Week Bar */}
          <div className="relative h-12 bg-gray-800/50 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-gray-600 rounded-lg flex items-center pl-4 transition-all duration-1000 ease-out"
              style={{ width: `${previousWeekWidth}%` }}
            >
              {editingPrevious && !isStatic ? (
                <input
                  type="text"
                  value={formatCurrency(previousWeekRevenue)}
                  onChange={(e) => handlePreviousEdit(e.target.value)}
                  onBlur={() => setEditingPrevious(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingPrevious, setEditingPrevious)}
                  className="bg-transparent text-white font-bold text-lg outline-none border-none w-32"
                  autoFocus
                />
              ) : (
                <span 
                  className={isStatic 
                    ? "text-white font-bold text-lg px-2 py-1"
                    : "text-white font-bold text-lg cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                  }
                  onClick={isStatic ? undefined : () => setEditingPrevious(true)}
                  title={isStatic ? undefined : "Click to edit"}
                >
                  {formatCurrency(previousWeekRevenue)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RevenueCard