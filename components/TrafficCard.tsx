"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'

const TrafficCard: React.FC = () => {
  const [currentWeekTraffic, setCurrentWeekTraffic] = useState(151280)
  const [previousWeekTraffic, setPreviousWeekTraffic] = useState(165650)
  const [cfdShare, setCfdShare] = useState(10.0) // Percentage of CFD Firm-Page Visits
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [editingPrevious, setEditingPrevious] = useState(false)
  const [editingCfdShare, setEditingCfdShare] = useState(false)
  const [tempCfdValue, setTempCfdValue] = useState("10.0")
  
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

  const handleCfdShareEdit = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0
    setCfdShare(Math.min(100, Math.max(0, numValue))) // Ensure between 0-100
  }

  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean, setEditing: (value: boolean) => void) => {
    if (e.key === 'Enter') {
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  // Calculate percentage heights for bars (relative to the highest value)
  const maxValue = Math.max(currentWeekTraffic, previousWeekTraffic)
  const currentWeekHeight = (currentWeekTraffic / maxValue) * 100
  const previousWeekHeight = (previousWeekTraffic / maxValue) * 100

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
      <CardContent className="pt-0 px-0 pb-0 flex-1 flex flex-col">
        {/* Separator Line */}
        <div className="w-full h-px bg-gray-600/30 mb-4"></div>
        <div className="flex-1 flex flex-col justify-center gap-8 px-4 py-4">
          <div className="flex items-end justify-center gap-8">
            {/* Previous Week Bar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-32 bg-gray-800/50 rounded-lg overflow-hidden flex flex-col justify-end">
                <div 
                className="w-full bg-gray-600 rounded-lg flex flex-col items-center justify-center transition-all duration-1000 ease-out"
                style={{ height: `${previousWeekHeight}%` }}
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
                    className="text-white font-bold text-center cursor-pointer hover:bg-gray-700/50 px-1 py-1 rounded transition-colors"
                    onClick={() => setEditingPrevious(true)}
                    title="Click to edit"
                    style={{ fontSize: `${Math.max(10, 16)}px` }}
                  >
                    {formatNumber(previousWeekTraffic)}
                  </span>
                )}
              </div>
            </div>
          </div>

            {/* Current Week Bar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-32 bg-gray-800/50 rounded-lg overflow-hidden flex flex-col justify-end">
                <div 
                className="w-full bg-blue-600 rounded-lg flex flex-col items-center justify-center transition-all duration-1000 ease-out"
                style={{ height: `${currentWeekHeight}%` }}
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
                    className="text-white font-bold text-center cursor-pointer hover:bg-blue-700/50 px-1 py-1 rounded transition-colors"
                    onClick={() => setEditingCurrent(true)}
                    title="Click to edit"
                    style={{ fontSize: `${Math.max(10, 16)}px` }}
                  >
                    {formatNumber(currentWeekTraffic)}
                  </span>
                )}
              </div>
            </div>
          </div>
          </div>
          
          {/* CFD Share Section */}
          <div className="border border-gray-600/30 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-medium text-base mb-1">Share of CFD</h3>
                  <p className="text-gray-400 text-xs">Firm-Page Visits</p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  {/* Pie Chart */}
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20" viewBox="0 0 100 100">
                      {/* Background circle (full) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="rgba(55, 65, 81, 0.6)"
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      {/* Pie slice for the percentage */}
                      {cfdShare >= 99.9 ? (
                        // Full circle when 100%
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="#6366f1"
                          className="transition-all duration-1000 ease-out"
                        />
                      ) : cfdShare > 0 ? (
                        // Pie slice for partial percentages
                        <path
                          d={`M 50,50 L 50,5 A 45,45 0 ${cfdShare > 50 ? 1 : 0},1 ${
                            50 + 45 * Math.sin((cfdShare / 100) * 2 * Math.PI)
                          },${
                            50 - 45 * Math.cos((cfdShare / 100) * 2 * Math.PI)
                          } Z`}
                          fill="#6366f1"
                          className="transition-all duration-1000 ease-out"
                        />
                      ) : null}
                      
                      {/* Border circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(75, 85, 99, 0.4)"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  
                  {/* Percentage below chart */}
                  <div className="text-center">
                    {editingCfdShare ? (
                      <input
                        type="text"
                        value={tempCfdValue}
                        onChange={(e) => {
                          setTempCfdValue(e.target.value)
                        }}
                        onBlur={() => {
                          const numValue = parseFloat(tempCfdValue) || 0
                          setCfdShare(Math.min(100, Math.max(0, numValue)))
                          setEditingCfdShare(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const numValue = parseFloat(tempCfdValue) || 0
                            setCfdShare(Math.min(100, Math.max(0, numValue)))
                            setEditingCfdShare(false)
                          }
                          if (e.key === 'Escape') {
                            setTempCfdValue(cfdShare.toString())
                            setEditingCfdShare(false)
                          }
                        }}
                        className="bg-gray-800 text-white text-xl font-bold outline-none border-none w-20 text-center"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="text-white text-xl font-bold cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                        onClick={() => {
                          setTempCfdValue(cfdShare.toString())
                          setEditingCfdShare(true)
                        }}
                        title="Click to edit"
                      >
                        {cfdShare.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TrafficCard