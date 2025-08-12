"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, DollarSign, Globe, Trophy, BarChart3, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompanyLogo } from '@/components/logos'
import { getLogoIdFromFirmName } from '@/lib/logoMapping'

interface FirmData {
  firmName: string
  currentPosition: number
  previousPosition: number
  revenueCurrent: number
  cfdShare: number
  visitsPinkCurrent?: number
  favorites?: number
  rating?: number
  reviews?: number
}

interface PopularityLeaderboardStaticProps {
  currentLogoId?: string
  currentFirmName?: string
  firmData?: FirmData
  competitors?: FirmData[]
  isStatic?: boolean
}

const PopularityLeaderboardStatic: React.FC<PopularityLeaderboardStaticProps> = ({ 
  currentLogoId: propLogoId, 
  currentFirmName: propFirmName,
  firmData,
  competitors = [],
  isStatic = true
}) => {

  // Create leaderboard data from firmData and competitors
  const leaderboardData = React.useMemo(() => {
    if (!firmData || !competitors.length) return []
    
    // Use the competitors array that already comes from getContextualRanking
    // This array is already sorted and filtered by the conditional logic
    return competitors.map(firm => ({
      rank: firm.currentPosition,
      name: firm.firmName,  // Show actual firm names for all competitors
      favorites: firm.visitsPinkCurrent || firm.favorites || 0,  // Coluna H - dados reais para todos
      revenue: firm.revenueCurrent,       // Revenue real para todos
      traffic: firm.cfdShare,             // Coluna N - dados reais para todos
      rating: firm.rating || (4 + Math.random() * 0.5),
      reviews: firm.reviews || Math.round(500 + Math.random() * 200),
      isTargetFirm: firm.firmName === firmData.firmName
    }))
  }, [firmData, competitors])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatRevenue = (num: number): string => {
    return `$${formatNumber(Math.round(num))}`
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
          <Star 
            className="w-3 h-3 absolute" 
            style={{ 
              fill: '#4B5563', 
              stroke: 'none' 
            }} 
          />
          
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

  const getBarWidth = (index: number): number => {
    // Visual positions get decreasing widths
    switch(index) {
      case 0: return 100
      case 1: return 95
      case 2: return 90
      case 3: return 85  // Target firm position
      case 4: return 80
      default: return 75
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
      <img 
        src="/slice21.png" 
        alt=""
        className="absolute top-0 right-0 opacity-50 pointer-events-none"
        style={{
          width: '350px',
          height: 'auto'
        }}
      />
      
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
          {leaderboardData.map((item, index) => {
            const isCurrentFirm = item.isTargetFirm
            
            return (
              <div key={index} className="flex flex-col justify-center">
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
                  <div className="absolute inset-0 bg-gray-800/30 rounded-lg"></div>
                  
                  <div 
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-4 z-10",
                      !isCurrentFirm && "bg-gradient-to-r from-gray-600/30 to-gray-500/20"
                    )}
                    style={{ 
                      width: `${getBarWidth(index)}%`,
                      backgroundColor: isCurrentFirm ? '#1E2244' : undefined
                    }}
                  >
                    <div className={cn(
                      "flex items-center gap-3 relative z-40", 
                      isCurrentFirm ? "text-sm" : "text-xs"
                    )}>
                      <div className="flex flex-col items-center gap-0">
                        <DollarSign className={cn(
                          "w-4 h-4",
                          isCurrentFirm ? "text-green-500" : "text-gray-400"
                        )} />
                        <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Revenue</span>
                        <span 
                          className={cn(
                            "font-medium",
                            !isCurrentFirm && "blur-lg",
                            isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                          )}
                        >
                          {formatRevenue(item.revenue)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-0">
                        <Globe className={cn(
                          "w-4 h-4",
                          isCurrentFirm ? "text-blue-400" : "text-gray-400"
                        )} />
                        <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Visits</span>
                        <span 
                          className={cn(
                            "font-medium",
                            !isCurrentFirm && "blur-lg",
                            isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                          )}
                        >
                          {formatVisitsPercentage(item.traffic)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-0">
                        <Heart className={cn(
                          "w-4 h-4",
                          isCurrentFirm ? "text-red-500 fill-red-500" : "text-gray-400"
                        )} />
                        <span className={cn("text-gray-300 mb-1", isCurrentFirm ? "text-xs" : "text-[10px]")}>Favorites</span>
                        <span 
                          className={cn(
                            "font-medium",
                            !isCurrentFirm && "blur-lg",
                            isCurrentFirm ? "text-xs text-white" : "text-[10px] text-gray-200"
                          )}
                        >
                          {formatNumber(item.favorites)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getRankBadgeVariant(item.rank)}
                          className={cn(
                            "text-lg font-bold px-3 py-1",
                            isCurrentFirm && "bg-blue-500 text-white"
                          )}
                        >
                          #{item.rank}
                        </Badge>
                        {getRankIcon(item.rank)}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CompanyLogo 
                          logoId={getLogoIdFromFirmName(item.name)} 
                          size={32}
                          fallbackText={item.name.substring(0, 2).toUpperCase()}
                        />
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-lg font-semibold",
                            isCurrentFirm ? "text-blue-400" : "text-gray-400"
                          )}>
                            {item.name}
                          </span>
                        </div>
                      </div>
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

export default PopularityLeaderboardStatic