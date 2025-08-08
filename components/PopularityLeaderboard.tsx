  "use client"

  import React, { useState, useCallback } from 'react'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import { Separator } from '@/components/ui/separator'
  import { Heart, DollarSign, Globe, Trophy, TrendingUp, BarChart3, Star } from 'lucide-react'
  import { cn } from '@/lib/utils'
  import { CompanyLogo } from '@/components/logos'

  interface LeaderboardItem {
    rank: number
    name: string
    favorites: number
    revenue: number
    traffic: number // Agora representa um percentual direto (ex: 58.6 para 58.6%)
    rating: number
    reviews: number
  }

  interface PopularityLeaderboardProps {
    currentLogoId?: string
    currentFirmName?: string
  }

  const PopularityLeaderboard: React.FC<PopularityLeaderboardProps> = ({ 
    currentLogoId: propLogoId, 
    currentFirmName: propFirmName 
  }) => {
    const initialData: LeaderboardItem[] = [
      { rank: 1, name: "???", favorites: 18230, revenue: 179300, traffic: 67.8, rating: 4.8, reviews: 892 },
      { rank: 2, name: "???", favorites: 17856, revenue: 171000, traffic: 65.4, rating: 4.6, reviews: 734 },
      { rank: 3, name: "???", favorites: 17450, revenue: 162200, traffic: 61.9, rating: 4.5, reviews: 621 },
      { rank: 4, name: "FundingPips", favorites: 16256, revenue: 151280, traffic: 58.6, rating: 4.4, reviews: 603 },
      { rank: 5, name: "???", favorites: 15987, revenue: 140000, traffic: 55.0, rating: 4.2, reviews: 548 }
    ]

    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>(initialData)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingField, setEditingField] = useState<'favorites' | 'revenue' | 'traffic' | 'rating' | 'reviews' | 'rank' | null>(null)
    const [tempValue, setTempValue] = useState<string>('')

    const currentFirmName = propFirmName || "Funding Pips"
    const currentFirmLogo = propLogoId || "fundingpips" // ID do logo correspondente
    const maxFavorites = Math.max(...leaderboardData.map(item => item.favorites))

    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat('en-US').format(num)
    }

    const formatRevenue = (num: number): string => {
      return `$${formatNumber(num)}`
    }

    const formatVisitsPercentage = (visits: number): string => {
      return `${visits.toFixed(2)}%`
    }

    const renderStars = (rating: number, isCurrentFirm: boolean) => {
      const stars = []
      const fullStars = Math.floor(rating)
      const hasPartialStar = rating % 1 !== 0
      
      for (let i = 0; i < 5; i++) {
        const isFilled = i < fullStars
        const isPartial = i === fullStars && hasPartialStar
        const fillPercentage = isPartial ? (rating % 1) * 100 : (isFilled ? 100 : 0)
        
        stars.push(
          <div key={i} className="relative w-3 h-3">
            {/* Background star */}
            <Star 
              className="w-3 h-3 absolute" 
              style={{ 
                fill: '#4B5563', 
                stroke: 'none' 
              }} 
            />
            
            {/* Filled star with gradient */}
            {fillPercentage > 0 && (
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star 
                  className="w-3 h-3 absolute"
                  style={{
                    fill: isCurrentFirm 
                      ? 'url(#star-gradient)' 
                      : '#9CA3AF',
                    stroke: 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      }
      
      return (
        <>
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9061F9" />
                <stop offset="100%" stopColor="#2566F2" />
              </linearGradient>
            </defs>
          </svg>
          {stars}
        </>
      )
    }

    const getRankIcon = (rank: number) => {
      if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
      if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />
      if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />
      return null
    }

    const getRankBadgeVariant = (rank: number): "default" | "secondary" | "outline" => {
      if (rank <= 3) return "default"
      return "secondary"
    }

    const getBarWidth = (rank: number): number => {
      // Baseado na posição: 1º = 100%, 2º = 90%, 3º = 80%, 4º = 75%, 5º = 75%
      switch(rank) {
        case 1: return 100
        case 2: return 90
        case 3: return 80
        case 4: return 75
        case 5: return 75
        default: return 75
      }
    }

    const reorderByFavorites = useCallback((data: LeaderboardItem[]): LeaderboardItem[] => {
      const sorted = [...data].sort((a, b) => b.favorites - a.favorites)
      return sorted.map((item, index) => ({ ...item, rank: index + 1 }))
    }, [])

    const reorderByRank = useCallback((data: LeaderboardItem[], currentRank: number, newRank: number): LeaderboardItem[] => {
      // Encontrar o item que está sendo movido
      const itemToMove = data.find(item => item.rank === currentRank)
      if (!itemToMove) return data
      
      // Criar array sem o item que está sendo movido
      const otherItems = data.filter(item => item.rank !== currentRank)
      
      // Inserir o item na nova posição e renumerar tudo
      const result: LeaderboardItem[] = []
      for (let i = 1; i <= 5; i++) {
        if (i === newRank) {
          result.push({ ...itemToMove, rank: i })
        } else {
          const nextItem = otherItems.shift()
          if (nextItem) {
            result.push({ ...nextItem, rank: i })
          }
        }
      }
      
      return result
    }, [])

    const handleEditStart = (rank: number, field: 'favorites' | 'revenue' | 'traffic' | 'rating' | 'reviews' | 'rank', currentValue: number) => {
      setEditingId(rank)
      setEditingField(field)
      setTempValue(currentValue.toString())
    }

    const handleEditSave = (rank: number) => {
      if (!editingField) return
      
      const newValue = (editingField === 'rating' || editingField === 'traffic') 
        ? parseFloat(tempValue.replace(/[^\d.]/g, '')) || 0
        : parseInt(tempValue.replace(/[^\d]/g, '')) || 0
      
      if (editingField === 'rank') {
        // Lógica especial para edição de rank
        const reorderedData = reorderByRank(leaderboardData, rank, newValue)
        setLeaderboardData(reorderedData)
      } else {
        const updatedData = leaderboardData.map(item => 
          item.rank === rank ? { ...item, [editingField]: newValue } : item
        )
        // Só reordena se editou favorites
        const finalData = editingField === 'favorites' ? reorderByFavorites(updatedData) : updatedData
        setLeaderboardData(finalData)
      }
      
      setEditingId(null)
      setEditingField(null)
      setTempValue('')
    }

    const handleEditCancel = () => {
      setEditingId(null)
      setEditingField(null)
      setTempValue('')
    }

    const handleKeyDown = (e: React.KeyboardEvent, rank: number) => {
      if (e.key === 'Enter') {
        handleEditSave(rank)
      } else if (e.key === 'Escape') {
        handleEditCancel()
      }
    }

    return (
      <Card 
        className="w-full h-full flex flex-col rounded-[10px] p-5 gap-5 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #13192B 0%, #1F182B 100%)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        {/* Slice graphic positioned at top right */}
        <img 
          src="/slice21.png" 
          alt=""
          className="absolute top-0 right-0 opacity-50 pointer-events-none"
          style={{
            width: '350px',
            height: 'auto'
          }}
        />
        
        {/* Slice graphic positioned at bottom left */}
        <img 
          src="/slice21.png" 
          alt=""
          className="absolute bottom-0 left-0 opacity-50 pointer-events-none"
          style={{
            width: '350px',
            height: 'auto',
            transform: 'rotate(180deg)'
          }}
        />
        
        <CardHeader className="pb-0 px-0 pt-0 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5" />
              Popularity Ranking
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0 pb-0 flex-1 flex flex-col relative z-10">
        <div className="flex-1 flex flex-col justify-between">
            {leaderboardData.map((item) => {
              const isCurrentFirm = item.name === "FundingPips" // Sempre usar o nome fixo da lista
              const isEditingFavorites = editingId === item.rank && editingField === 'favorites'
              const isEditingRevenue = editingId === item.rank && editingField === 'revenue'
              const isEditingVisits = editingId === item.rank && editingField === 'traffic'
              const isEditingRating = editingId === item.rank && editingField === 'rating'
              const isEditingReviews = editingId === item.rank && editingField === 'reviews'
              const isEditingRank = editingId === item.rank && editingField === 'rank'
              
              return (
                <div key={item.rank} className="flex flex-col justify-center">
                  <div
                    className={cn(
                      "relative rounded-lg p-4 transition-all duration-300 overflow-hidden",
                      isCurrentFirm && [
                        "border-2 border-blue-500/50",
                        "shadow-lg shadow-blue-500/20",
                        "scale-[1.02]",
                        "before:absolute before:inset-0 before:rounded-lg",
                        "before:bg-gradient-to-r before:from-blue-400/20 before:to-indigo-400/20",
                        "before:blur-xl before:-z-10"
                      ],
                      !isCurrentFirm && "hover:bg-gray-900/50"
                    )}
                    style={isCurrentFirm ? { backgroundColor: '#1E2244' } : {}}
                  >
                    {/* Background bar */}
                    <div className="absolute inset-0 bg-gray-800/30 rounded-lg"></div>
                    
                    {/* Progress bar */}
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-4 z-10 pointer-events-none",
                        !isCurrentFirm && "bg-gradient-to-r from-gray-600/30 to-gray-500/20"
                      )}
                      style={{ 
                        width: `${getBarWidth(item.rank)}%`,
                        backgroundColor: isCurrentFirm ? '#1E2244' : undefined
                      }}
                    >
                      <div className={cn("flex items-center gap-3 relative z-40 pointer-events-auto", isCurrentFirm ? "text-sm" : "text-xs")}>
                        <div className="flex flex-col items-center gap-1 group pointer-events-auto">
                          {isEditingRating ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.rank)}
                              onBlur={() => handleEditSave(item.rank)}
                              className={cn("bg-gray-800 text-white px-1.5 py-0.5 rounded-full w-8 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-center border border-blue-500", isCurrentFirm ? "text-xs" : "text-[10px]")}
                              autoFocus
                            />
                          ) : (
                            <div 
                              className={cn(
                                "px-1.5 py-0.5 rounded-full cursor-pointer transition-all duration-200 border",
                                isCurrentFirm 
                                  ? "bg-blue-900/30 border-blue-500 hover:bg-blue-800/40" 
                                  : "bg-gray-700/30 border-gray-500 hover:bg-gray-600/40"
                              )}
                              onClick={() => handleEditStart(item.rank, 'rating', item.rating)}
                            >
                              <span className={cn(
                                "font-bold",
                                isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                              )}>
                                {item.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-0.5">
                            {renderStars(item.rating, isCurrentFirm)}
                          </div>
                          
                          <span className={cn(
                            "font-medium cursor-pointer hover:bg-gray-700/50 px-1 py-0.5 rounded transition-colors",
                            isCurrentFirm ? "text-xs text-gray-300" : "text-[10px] text-gray-400"
                          )}>
                            {isEditingReviews ? (
                              <input
                                type="text"
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.rank)}
                                onBlur={() => handleEditSave(item.rank)}
                                className={cn("bg-gray-800 text-white px-2 py-1 rounded w-12 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-center", isCurrentFirm ? "text-xs" : "text-[10px]")}
                                autoFocus
                              />
                            ) : (
                              <span onClick={() => handleEditStart(item.rank, 'reviews', item.reviews)}>
                                {item.reviews}
                              </span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-0 group pointer-events-auto">
                          <DollarSign className={cn(
                            "w-4 h-4 transition-colors",
                            isCurrentFirm ? "text-green-500" : "text-gray-400"
                          )} />
                          <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Revenue</span>
                          {isEditingRevenue ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.rank)}
                              onBlur={() => handleEditSave(item.rank)}
                              className={cn("bg-gray-800 text-white px-2 py-1 rounded w-16 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-center", isCurrentFirm ? "text-xs" : "text-[10px]")}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={cn(
                                "font-medium cursor-pointer hover:bg-gray-700/50 px-1 py-0.5 rounded transition-colors",
                                isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                              )}
                              onClick={() => handleEditStart(item.rank, 'revenue', item.revenue)}
                            >
                              {formatRevenue(item.revenue)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-0 group pointer-events-auto">
                          <Globe className={cn(
                            "w-4 h-4 transition-colors",
                            isCurrentFirm ? "text-blue-400" : "text-gray-400"
                          )} />
                          <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Visits</span>
                          {isEditingVisits ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.rank)}
                              onBlur={() => handleEditSave(item.rank)}
                              className={cn("bg-gray-800 text-white px-2 py-1 rounded w-16 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-center", isCurrentFirm ? "text-xs" : "text-[10px]")}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={cn(
                                "font-medium cursor-pointer hover:bg-gray-700/50 px-1 py-0.5 rounded transition-colors",
                                isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                              )}
                              onClick={() => handleEditStart(item.rank, 'traffic', item.traffic)}
                            >
                              {formatVisitsPercentage(item.traffic)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center gap-0 group pointer-events-auto">
                          <Heart className={cn(
                            "w-4 h-4 transition-colors",
                            isCurrentFirm ? "text-red-500 fill-red-500" : "text-gray-400"
                          )} />
                          <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Favorites</span>
                          {isEditingFavorites ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.rank)}
                              onBlur={() => handleEditSave(item.rank)}
                              className={cn("bg-gray-800 text-white px-2 py-1 rounded w-16 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-center", isCurrentFirm ? "text-xs" : "text-[10px]")}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={cn(
                                "font-medium cursor-pointer hover:bg-gray-700/50 px-1 py-0.5 rounded transition-colors",
                                isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                              )}
                              onClick={() => handleEditStart(item.rank, 'favorites', item.favorites)}
                            >
                              {formatNumber(item.favorites)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-none">
                      <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="flex items-center gap-2">
                          {isEditingRank ? (
                            <input
                              type="text"
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.rank)}
                              onBlur={() => handleEditSave(item.rank)}
                              className="bg-gray-800 text-white px-3 py-1 rounded text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-center w-16 border border-blue-500"
                              autoFocus
                            />
                          ) : (
                            <Badge 
                              variant={getRankBadgeVariant(item.rank)}
                              className={cn(
                                "text-lg font-bold px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity",
                                isCurrentFirm && "bg-blue-500 text-white hover:bg-blue-600"
                              )}
                              onClick={() => handleEditStart(item.rank, 'rank', item.rank)}
                              title="Click to edit position"
                            >
                              #{item.rank}
                            </Badge>
                          )}
                          {getRankIcon(item.rank)}
                        </div>
                        
                        {isCurrentFirm ? (
                          <div className="flex items-center gap-3">
                            <CompanyLogo 
                              logoId={currentFirmLogo} 
                              size={32}
                              fallbackText="FP"
                            />
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold text-blue-400">
                                {currentFirmName}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-gray-400">
                              {item.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  export default PopularityLeaderboard