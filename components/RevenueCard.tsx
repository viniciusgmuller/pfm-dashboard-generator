"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

const RevenueCard: React.FC = () => {
  const [currentWeekRevenue, setCurrentWeekRevenue] = useState(151280)
  const [previousWeekRevenue, setPreviousWeekRevenue] = useState(165650)
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [editingPrevious, setEditingPrevious] = useState(false)
  
  // Calculate percentage change: ((current - previous) / previous) * 100
  const changePercentage = ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
  
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
  const maxValue = Math.max(currentWeekRevenue, previousWeekRevenue)
  const currentWeekWidth = (currentWeekRevenue / maxValue) * 100
  const previousWeekWidth = (previousWeekRevenue / maxValue) * 100

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
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
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center gap-6 px-4">
          {/* Current Week Bar */}
          <div className="relative h-12 bg-gray-800/50 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-lg flex items-center pl-4 transition-all duration-1000 ease-out"
              style={{ width: `${currentWeekWidth}%` }}
            >
              {editingCurrent ? (
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
                  className="text-white font-bold text-lg cursor-pointer hover:bg-blue-700/50 px-2 py-1 rounded transition-colors"
                  onClick={() => setEditingCurrent(true)}
                  title="Click to edit"
                >
                  {formatCurrency(currentWeekRevenue)}
                </span>
              )}
            </div>
          </div>

          {/* Previous Week Bar */}
          <div className="relative h-12 bg-gray-800/50 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-lg flex items-center pl-4 transition-all duration-1000 ease-out"
              style={{ width: `${previousWeekWidth}%` }}
            >
              {editingPrevious ? (
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
                  className="text-white font-bold text-lg cursor-pointer hover:bg-purple-700/50 px-2 py-1 rounded transition-colors"
                  onClick={() => setEditingPrevious(true)}
                  title="Click to edit"
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