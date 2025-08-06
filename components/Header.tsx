"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-6 bg-gray-900/50 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">FP</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Funding Pips</h1>
            <p className="text-gray-400 text-sm">Weekly Report</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30 px-3 py-1">
            Previous Week
          </Badge>
          <div className="text-sm text-gray-400">
            Jun 21 - 28
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            Current Week
          </Badge>
          <div className="text-sm text-gray-400">
            Jun 28 - Aug 3
          </div>
        </div>

        <div className="flex items-center gap-6 ml-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Total PFM Visits</div>
            <div className="text-lg font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              258,351
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Total CFD Visits</div>
            <div className="text-lg font-bold text-white flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              108,346
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header