"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'

interface SimpleCardProps {
  title: string
  value?: string
  percentage?: number
  type?: 'revenue' | 'traffic' | 'favorite'
}

const SimpleCard: React.FC<SimpleCardProps> = ({ title, value, percentage, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'revenue':
        return null
      case 'traffic':
        return <BarChart3 className="w-5 h-5" />
      case 'favorite':
        return <BarChart3 className="w-5 h-5" />
      default:
        return null
    }
  }

  const isPositive = percentage && percentage > 0
  const isNegative = percentage && percentage < 0

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            {getIcon()}
            <span className="text-sm font-medium">{title}</span>
          </div>
          {percentage && (
            <Badge 
              className={`flex items-center gap-1 ${
                isPositive ? 'bg-green-600 text-white' : 
                isNegative ? 'bg-red-600 text-white' : 
                'bg-gray-600 text-white'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentage).toFixed(2)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {value && (
        <CardContent className="pt-0">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-4">
              {value}
            </div>
          </div>
        </CardContent>
      )}
      
      {!value && (
        <CardContent className="pt-0">
          <div className="h-40 bg-gray-800/50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 text-sm">Chart Area</div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default SimpleCard