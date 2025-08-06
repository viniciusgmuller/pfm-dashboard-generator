"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'

const TrafficCard: React.FC = () => {
  const [currentWeekTraffic, setCurrentWeekTraffic] = useState(151280)
  const [previousWeekTraffic, setPreviousWeekTraffic] = useState(165650)
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [editingPrevious, setEditingPrevious] = useState(false)
  
  // Calculate percentage change: ((current - previous) / previous) * 100
  const changePercentage = ((currentWeekTraffic - previousWeekTraffic) / previousWeekTraffic) * 100
  
  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  const handleCurrentEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setCurrentWeekTraffic(numValue)
  }

  const handlePreviousEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setPreviousWeekTraffic(numValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean, setEditing: (value: boolean) => void) => {
    if (e.key === 'Enter') {
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  // Calculate bubble sizes based on traffic values (relative to max value)
  const maxValue = Math.max(currentWeekTraffic, previousWeekTraffic)
  const minBubbleSize = 60 // minimum bubble size in pixels
  const maxBubbleSize = 120 // maximum bubble size in pixels
  
  const currentBubbleSize = minBubbleSize + ((currentWeekTraffic / maxValue) * (maxBubbleSize - minBubbleSize))
  const previousBubbleSize = minBubbleSize + ((previousWeekTraffic / maxValue) * (maxBubbleSize - minBubbleSize))

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Traffic Visitors</span>
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
        <div className="flex-1 flex items-center justify-center gap-8 px-4">
          {/* Current Week Bubble */}
          <div className="flex flex-col items-center">
            <div 
              className="bg-blue-600 rounded-full flex items-center justify-center transition-all duration-1000 ease-out shadow-lg"
              style={{ 
                width: `${currentBubbleSize}px`, 
                height: `${currentBubbleSize}px` 
              }}
            >
              {editingCurrent ? (
                <input
                  type="text"
                  value={formatNumber(currentWeekTraffic)}
                  onChange={(e) => handleCurrentEdit(e.target.value)}
                  onBlur={() => setEditingCurrent(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingCurrent, setEditingCurrent)}
                  className="bg-transparent text-white font-bold text-center outline-none border-none w-20 text-sm"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-white font-bold text-center cursor-pointer hover:bg-blue-700/50 px-2 py-1 rounded transition-colors text-sm"
                  onClick={() => setEditingCurrent(true)}
                  title="Click to edit"
                  style={{ fontSize: `${Math.max(10, currentBubbleSize / 8)}px` }}
                >
                  {formatNumber(currentWeekTraffic)}
                </span>
              )}
            </div>
          </div>

          {/* Previous Week Bubble */}
          <div className="flex flex-col items-center">
            <div 
              className="bg-purple-600 rounded-full flex items-center justify-center transition-all duration-1000 ease-out shadow-lg"
              style={{ 
                width: `${previousBubbleSize}px`, 
                height: `${previousBubbleSize}px` 
              }}
            >
              {editingPrevious ? (
                <input
                  type="text"
                  value={formatNumber(previousWeekTraffic)}
                  onChange={(e) => handlePreviousEdit(e.target.value)}
                  onBlur={() => setEditingPrevious(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingPrevious, setEditingPrevious)}
                  className="bg-transparent text-white font-bold text-center outline-none border-none w-20 text-sm"
                  autoFocus
                />
              ) : (
                <span 
                  className="text-white font-bold text-center cursor-pointer hover:bg-purple-700/50 px-2 py-1 rounded transition-colors text-sm"
                  onClick={() => setEditingPrevious(true)}
                  title="Click to edit"
                  style={{ fontSize: `${Math.max(10, previousBubbleSize / 8)}px` }}
                >
                  {formatNumber(previousWeekTraffic)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrafficCard