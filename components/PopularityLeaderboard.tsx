"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Heart, DollarSign, Globe, Trophy, TrendingUp, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardItem {
  rank: number
  name: string
  favorites: number
  revenue: number
  traffic: number
}

const PopularityLeaderboard: React.FC = () => {
  const leaderboardData: LeaderboardItem[] = [
    { rank: 1, name: "???", favorites: 18230, revenue: 179300, traffic: 175280 },
    { rank: 2, name: "???", favorites: 17856, revenue: 171000, traffic: 168950 },
    { rank: 3, name: "???", favorites: 17450, revenue: 162200, traffic: 159870 },
    { rank: 4, name: "FundingPips", favorites: 16256, revenue: 151280, traffic: 151280 },
    { rank: 5, name: "???", favorites: 15987, revenue: 140000, traffic: 142000 }
  ]

  const currentFirmRank = 4

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatRevenue = (num: number): string => {
    return `$${formatNumber(num)}`
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

  return (
    <Card className="w-full bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5" />
            Popularity Ranking
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-evenly">
          {leaderboardData.map((item, index) => {
            const isCurrentFirm = item.rank === currentFirmRank
            
            return (
              <div key={item.rank} className="flex-1 flex flex-col justify-center">
                <div
                  className={cn(
                    "relative rounded-lg p-4 transition-all duration-300",
                    isCurrentFirm && [
                      "bg-gradient-to-r from-blue-950/30 to-indigo-950/30",
                      "border-2 border-blue-500/50",
                      "shadow-lg shadow-blue-500/20",
                      "scale-[1.02]",
                      "before:absolute before:inset-0 before:rounded-lg",
                      "before:bg-gradient-to-r before:from-blue-400/20 before:to-indigo-400/20",
                      "before:blur-xl before:-z-10"
                    ],
                    !isCurrentFirm && "hover:bg-gray-900/50"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getRankBadgeVariant(item.rank)}
                          className={cn(
                            "text-lg font-bold px-3 py-1",
                            isCurrentFirm && "bg-blue-500 text-white hover:bg-blue-600"
                          )}
                        >
                          #{item.rank}
                        </Badge>
                        {getRankIcon(item.rank)}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-lg font-semibold",
                          isCurrentFirm ? "text-blue-400" : "text-gray-400"
                        )}>
                          {item.name}
                        </span>
                        {isCurrentFirm && (
                          <Badge variant="outline" className="w-fit mt-1 text-xs border-blue-500 text-blue-600">
                            Your Firm
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                      <div className="flex items-center gap-1.5 group">
                        <Heart className={cn(
                          "w-4 h-4 transition-colors",
                          isCurrentFirm ? "text-red-500 fill-red-500" : "text-gray-500 group-hover:text-red-500"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isCurrentFirm ? "text-gray-100" : "text-gray-300"
                        )}>
                          {formatNumber(item.favorites)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 group">
                        <DollarSign className={cn(
                          "w-4 h-4 transition-colors",
                          isCurrentFirm ? "text-green-600" : "text-gray-500 group-hover:text-green-600"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isCurrentFirm ? "text-gray-100" : "text-gray-300"
                        )}>
                          {formatRevenue(item.revenue)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 group">
                        <Globe className={cn(
                          "w-4 h-4 transition-colors",
                          isCurrentFirm ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isCurrentFirm ? "text-gray-100" : "text-gray-300"
                        )}>
                          {formatNumber(item.traffic)}
                          <span className="text-xs ml-1 text-gray-500">visits</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Badge variant="outline" className="text-xs">Legend</Badge>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> Favorites
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Revenue
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Traffic
              </span>
            </div>
            <Badge className="bg-blue-900 text-blue-300">
              Updated today
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PopularityLeaderboard