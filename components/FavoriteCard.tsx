"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingDown, TrendingUp, ArrowDown, ArrowUp, Trophy, Award } from 'lucide-react'

interface FavoriteCardProps {
  previousWeek?: number
  currentWeek?: number
  favoritesAdded?: number
  favoritesChange?: number
  currentPosition?: number
  previousPosition?: number
  isStatic?: boolean
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ 
  previousWeek, 
  currentWeek, 
  favoritesAdded,
  favoritesChange,
  currentPosition,
  previousPosition,
  isStatic = false
}) => {
  const [currentWeekFavorites, setCurrentWeekFavorites] = useState(currentWeek ?? 16514)
  const [previousWeekFavorites, setPreviousWeekFavorites] = useState(previousWeek ?? 16269)
  const [currentRanking, setCurrentRanking] = useState(currentPosition ?? 1)
  const [previousRanking, setPreviousRanking] = useState(previousPosition ?? 3)
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [editingPrevious, setEditingPrevious] = useState(false)
  const [editingCurrentRanking, setEditingCurrentRanking] = useState(false)
  const [editingPreviousRanking, setEditingPreviousRanking] = useState(false)
  const [tempCurrentRanking, setTempCurrentRanking] = useState('')
  const [tempPreviousRanking, setTempPreviousRanking] = useState('')
  
  // Use real percentage from CSV (Column J) or calculate if not provided
  const changePercentage = favoritesChange ?? (
    previousWeekFavorites === 0 
      ? (currentWeekFavorites > 0 ? 100 : 0) 
      : ((currentWeekFavorites - previousWeekFavorites) / previousWeekFavorites) * 100
  )
  
  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  const handleCurrentEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setCurrentWeekFavorites(numValue)
  }

  const handlePreviousEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setPreviousWeekFavorites(numValue)
  }

  const handleCurrentRankingEdit = (value: string) => {
    setTempCurrentRanking(value)
  }

  const handlePreviousRankingEdit = (value: string) => {
    setTempPreviousRanking(value)
  }

  const saveCurrentRanking = () => {
    const numValue = parseInt(tempCurrentRanking.replace(/[^\d]/g, '')) || 1
    setCurrentRanking(numValue)
    setEditingCurrentRanking(false)
    setTempCurrentRanking('')
  }

  const savePreviousRanking = () => {
    const numValue = parseInt(tempPreviousRanking.replace(/[^\d]/g, '')) || 1
    setPreviousRanking(numValue)
    setEditingPreviousRanking(false)
    setTempPreviousRanking('')
  }

  const startEditingCurrentRanking = () => {
    setTempCurrentRanking(currentRanking.toString())
    setEditingCurrentRanking(true)
  }

  const startEditingPreviousRanking = () => {
    setTempPreviousRanking(previousRanking.toString())
    setEditingPreviousRanking(true)
  }

  const cancelCurrentRankingEdit = () => {
    setEditingCurrentRanking(false)
    setTempCurrentRanking('')
  }

  const cancelPreviousRankingEdit = () => {
    setEditingPreviousRanking(false)
    setTempPreviousRanking('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, isEditing: boolean, setEditing: (value: boolean) => void) => {
    if (e.key === 'Enter') {
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  // Calculate bubble sizes based on favorite values (relative to max value)
  const maxValue = Math.max(currentWeekFavorites, previousWeekFavorites, 1) // Avoid division by zero
  const minBubbleSize = 80 // minimum bubble size in pixels
  const maxBubbleSize = 140 // maximum bubble size in pixels
  
  const currentBubbleSize = minBubbleSize + ((currentWeekFavorites / maxValue) * (maxBubbleSize - minBubbleSize))
  const previousBubbleSize = minBubbleSize + ((previousWeekFavorites / maxValue) * (maxBubbleSize - minBubbleSize))

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
            <span className="text-sm font-medium">Favorite Change</span>
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
        <div className="w-full h-px bg-gray-600/30 mb-2"></div>
        <div className="flex-1 flex flex-col justify-between gap-4 px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {/* Previous Week Bubble */}
            <div className="flex flex-col items-center">
              <div 
              className="bg-gray-600 rounded-full flex items-center justify-center transition-all duration-1000 ease-out shadow-lg"
              style={{ 
                width: `${previousBubbleSize}px`, 
                height: `${previousBubbleSize}px` 
              }}
            >
              {editingPrevious && !isStatic ? (
                <input
                  type="text"
                  value={formatNumber(previousWeekFavorites)}
                  onChange={(e) => handlePreviousEdit(e.target.value)}
                  onBlur={() => setEditingPrevious(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingPrevious, setEditingPrevious)}
                  className="bg-transparent text-white font-bold text-center outline-none border-none w-20 text-sm"
                  autoFocus
                />
              ) : (
                <span 
                  className={isStatic 
                    ? "text-white font-bold text-center px-2 py-1 text-sm"
                    : "text-white font-bold text-center cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded transition-colors text-sm"
                  }
                  onClick={isStatic ? undefined : () => setEditingPrevious(true)}
                  title={isStatic ? undefined : "Click to edit"}
                  style={{ fontSize: `${Math.max(10, previousBubbleSize / 8)}px` }}
                >
                  {formatNumber(previousWeekFavorites)}
                </span>
              )}
            </div>
          </div>

            {/* Current Week Bubble */}
            <div className="flex flex-col items-center">
              <div 
              className="bg-blue-600 rounded-full flex items-center justify-center transition-all duration-1000 ease-out shadow-lg"
              style={{ 
                width: `${currentBubbleSize}px`, 
                height: `${currentBubbleSize}px` 
              }}
            >
              {editingCurrent && !isStatic ? (
                <input
                  type="text"
                  value={formatNumber(currentWeekFavorites)}
                  onChange={(e) => handleCurrentEdit(e.target.value)}
                  onBlur={() => setEditingCurrent(false)}
                  onKeyDown={(e) => handleKeyPress(e, editingCurrent, setEditingCurrent)}
                  className="bg-transparent text-white font-bold text-center outline-none border-none w-20 text-sm"
                  autoFocus
                />
              ) : (
                <span 
                  className={isStatic 
                    ? "text-white font-bold text-center px-2 py-1 text-sm"
                    : "text-white font-bold text-center cursor-pointer hover:bg-blue-700/50 px-2 py-1 rounded transition-colors text-sm"
                  }
                  onClick={isStatic ? undefined : () => setEditingCurrent(true)}
                  title={isStatic ? undefined : "Click to edit"}
                  style={{ fontSize: `${Math.max(10, currentBubbleSize / 8)}px` }}
                >
                  {formatNumber(currentWeekFavorites)}
                </span>
              )}
            </div>
          </div>
          </div>
          
          {/* Ranking Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Ranking
              </h3>
              {currentRanking === 1 ? (
                <Badge 
                  className="text-yellow-400 border-yellow-500/40 px-3 py-1 text-sm flex items-center gap-2 font-bold"
                  style={{ backgroundColor: '#322D1C' }}
                >
                  <Award className="w-4 h-4" />
                  #{currentRanking} Position
                </Badge>
              ) : (
                <Badge className={`px-2 py-1 text-xs flex items-center gap-1 ${
                  previousRanking > currentRanking
                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                    : previousRanking < currentRanking
                    ? 'bg-red-600/20 text-red-400 border-red-600/30'
                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                }`}>
                  {previousRanking > currentRanking ? (
                    <>
                      <ArrowUp className="w-3 h-3" />
                      +{previousRanking - currentRanking}
                    </>
                  ) : previousRanking < currentRanking ? (
                    <>
                      <ArrowDown className="w-3 h-3" />
                      -{currentRanking - previousRanking}
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      </div>
                      No Change
                    </>
                  )}
                </Badge>
              )}
            </div>
            
            {/* Separator Line */}
            <div className="w-full h-px bg-gray-600/30 my-2"></div>
            
            <div className="flex gap-4">
              {/* Previous Week Ranking */}
              <div className="flex-1">
                <div className="bg-gray-700 rounded-full px-4 py-3 flex items-center justify-between">
                  {editingPreviousRanking ? (
                    <input
                      type="text"
                      value={tempPreviousRanking}
                      onChange={(e) => handlePreviousRankingEdit(e.target.value)}
                      onBlur={savePreviousRanking}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePreviousRanking()
                        if (e.key === 'Escape') cancelPreviousRankingEdit()
                      }}
                      className="bg-transparent text-white font-bold text-lg outline-none border-none w-full text-center"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                    />
                  ) : (
                    <span 
                      className="text-white font-bold text-lg cursor-pointer flex-1 text-center"
                      onClick={startEditingPreviousRanking}
                      title="Click to edit"
                    >
                      {previousRanking === 1 ? '1st' : previousRanking === 2 ? '2nd' : previousRanking === 3 ? '3rd' : `${previousRanking}th`}
                    </span>
                  )}
                  {/* Seta indica direção da mudança */}
                  {previousRanking > currentRanking ? (
                    <ArrowUp className="w-4 h-4 text-green-400 ml-2" />
                  ) : previousRanking < currentRanking ? (
                    <ArrowDown className="w-4 h-4 text-red-400 ml-2" />
                  ) : (
                    <div className="w-4 h-4 ml-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Current Week Ranking */}
              <div className="flex-1">
                <div className="bg-blue-600 rounded-full px-4 py-3 flex items-center justify-between">
                  {editingCurrentRanking ? (
                    <input
                      type="text"
                      value={tempCurrentRanking}
                      onChange={(e) => handleCurrentRankingEdit(e.target.value)}
                      onBlur={saveCurrentRanking}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCurrentRanking()
                        if (e.key === 'Escape') cancelCurrentRankingEdit()
                      }}
                      className="bg-transparent text-white font-bold text-lg outline-none border-none w-full text-center"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                    />
                  ) : (
                    <span 
                      className="text-white font-bold text-lg cursor-pointer flex-1 text-center"
                      onClick={startEditingCurrentRanking}
                      title="Click to edit"
                    >
                      {currentRanking === 1 ? '1st' : currentRanking === 2 ? '2nd' : currentRanking === 3 ? '3rd' : `${currentRanking}th`}
                    </span>
                  )}
                  {/* Seta indica direção da mudança */}
                  {previousRanking > currentRanking ? (
                    <ArrowUp className="w-4 h-4 text-green-400 ml-2" />
                  ) : previousRanking < currentRanking ? (
                    <ArrowDown className="w-4 h-4 text-red-400 ml-2" />
                  ) : (
                    <div className="w-4 h-4 ml-2 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FavoriteCard