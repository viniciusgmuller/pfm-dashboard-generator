"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingDown } from 'lucide-react'

const RevenueCard: React.FC = () => {
  const changePercentage = -8.67

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Revenue Generated</span>
          </div>
          <Badge className="flex items-center gap-1 bg-red-600 text-white">
            <TrendingDown className="w-3 h-3" />
            {Math.abs(changePercentage).toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1 bg-gray-800/30 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 text-sm">Revenue Chart Placeholder</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RevenueCard