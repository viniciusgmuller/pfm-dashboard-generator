"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp } from 'lucide-react'

const FavoriteCard: React.FC = () => {
  const changePercentage = 1.47

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-medium">Favorite Change</span>
          </div>
          <Badge className="flex items-center gap-1 bg-green-600 text-white">
            <TrendingUp className="w-3 h-3" />
            {changePercentage.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 bg-gray-800/30 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Favorites Chart Placeholder</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FavoriteCard