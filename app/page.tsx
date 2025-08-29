"use client"

import Header from '@/components/Header'
import PopularityLeaderboard from '@/components/PopularityLeaderboard'
import RevenueCard from '@/components/RevenueCard'
import TrafficCard from '@/components/TrafficCard'
import FavoriteCard from '@/components/FavoriteCard'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Wand2, Layers } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DashboardCategory, globalConfig } from '@/lib/globalConfig'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryParam = searchParams.get('category') as DashboardCategory | null
  const [category, setCategory] = useState<DashboardCategory>(
    categoryParam || globalConfig.defaultCategory
  )
  const [currentLogoId, setCurrentLogoId] = useState('fundingpips')
  const [currentFirmName, setCurrentFirmName] = useState('Funding Pips')

  useEffect(() => {
    // Reset to appropriate defaults when category changes
    if (category === 'futures') {
      setCurrentLogoId('myfundedfutures')
      setCurrentFirmName('My Funded Futures')
    } else {
      setCurrentLogoId('fundingpips')
      setCurrentFirmName('Funding Pips')
    }
  }, [category])

  const handleCategoryChange = (newCategory: DashboardCategory) => {
    setCategory(newCategory)
    router.push(`/?category=${newCategory}`)
  }

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: 'url("/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#100E0F'
      }}
    >
      <div className="w-full max-w-[1560px] max-h-[800px] flex flex-col relative">
        <Header 
          onLogoChange={setCurrentLogoId} 
          onFirmNameChange={setCurrentFirmName}
          category={category}
        />
        
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="lg:col-span-1 h-full">
              <PopularityLeaderboard 
                currentLogoId={currentLogoId}
                currentFirmName={currentFirmName}
              />
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6 h-full">
              <div className="h-[100%]">
                <RevenueCard />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <TrafficCard />
                <FavoriteCard />
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Selector Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="fixed bottom-8 left-8 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all z-10"
              variant="outline"
            >
              <Layers className="w-5 h-5" />
              {globalConfig.categories[category].name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem 
              onClick={() => handleCategoryChange('prop-trading')}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">Prop Trading</span>
                <span className="text-xs text-gray-500">Traditional prop firms</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleCategoryChange('futures')}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">Futures</span>
                <span className="text-xs text-gray-500">Futures trading firms</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Floating Action Button for Generator */}
        <Link
          href="/generator"
          className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all z-10"
        >
          <Wand2 className="w-5 h-5" />
          Generate Dashboards
        </Link>
      </div>
    </main>
  )
}