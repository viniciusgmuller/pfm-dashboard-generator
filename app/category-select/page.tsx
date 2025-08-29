"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardCategory, globalConfig } from '@/lib/globalConfig'
import { TrendingUp, BarChart3 } from 'lucide-react'

export default function CategorySelect() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>('prop-trading')

  const handleCategorySelect = (category: DashboardCategory) => {
    setSelectedCategory(category)
    // Navigate to the dashboard with the selected category
    router.push(`/?category=${category}`)
  }

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundImage: 'url("/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#100E0F'
      }}
    >
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Select Dashboard Category
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prop Trading Category */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedCategory === 'prop-trading' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleCategorySelect('prop-trading')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <span className="text-sm text-gray-500">Default</span>
              </div>
              <CardTitle className="mt-4">Prop Trading</CardTitle>
              <CardDescription>
                View dashboards for prop trading firms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• {globalConfig.categories['prop-trading'].visitors.toLocaleString()} total visitors</p>
                <p>• Traditional prop trading firms</p>
                <p>• CFD and forex trading focus</p>
              </div>
              <Button 
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCategorySelect('prop-trading')
                }}
              >
                Select Prop Trading
              </Button>
            </CardContent>
          </Card>

          {/* Futures Category */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedCategory === 'futures' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => handleCategorySelect('futures')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart3 className="h-8 w-8 text-green-500" />
                <span className="text-sm text-gray-500">New</span>
              </div>
              <CardTitle className="mt-4">Futures</CardTitle>
              <CardDescription>
                View dashboards for futures trading firms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• {globalConfig.categories['futures'].visitors.toLocaleString()} total visitors</p>
                <p>• Futures trading specialists</p>
                <p>• Commodity and index futures</p>
              </div>
              <Button 
                className="w-full mt-4"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCategorySelect('futures')
                }}
              >
                Select Futures
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Select a category to view the corresponding dashboards with appropriate data
          </p>
        </div>
      </div>
    </main>
  )
}