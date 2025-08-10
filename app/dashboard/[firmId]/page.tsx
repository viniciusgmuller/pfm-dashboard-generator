"use client"

import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import PopularityLeaderboardStatic from '@/components/PopularityLeaderboardStatic'
import RevenueCard from '@/components/RevenueCard'
import TrafficCard from '@/components/TrafficCard'
import FavoriteCard from '@/components/FavoriteCard'
import { getLogoIdFromFirmName } from '@/lib/logoMapping'
import { useEffect, useState } from 'react'

interface FirmData {
  firmName: string
  currentPosition: number
  previousPosition: number
  revenuePrevious: number
  revenueCurrent: number
  revenueChange: number
  visitsPinkPrevious: number
  visitsPinkCurrent: number
  favoritesAdded: number
  favoritesChange: number
  visitsAzulPrevious: number
  trafficCurrent: number
  trafficIncrease: number
  cfdShare: number
  favorites?: number
  rating?: number
  reviews?: number
}

export default function DashboardPage({ params }: { params: { firmId: string } }) {
  const searchParams = useSearchParams()
  const [firmData, setFirmData] = useState<FirmData | null>(null)
  const [competitors, setCompetitors] = useState<FirmData[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Parse firm data from URL params
    const dataParam = searchParams.get('data')
    const competitorsParam = searchParams.get('competitors')
    
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam))
        setFirmData(parsedData)
      } catch (e) {
        console.error('Failed to parse firm data:', e)
      }
    }

    if (competitorsParam) {
      try {
        const parsedCompetitors = JSON.parse(decodeURIComponent(competitorsParam))
        setCompetitors(parsedCompetitors)
      } catch (e) {
        console.error('Failed to parse competitors data:', e)
      }
    }

    // Signal readiness for screenshot
    setTimeout(() => {
      setIsReady(true)
      // Add data attribute for Puppeteer to detect
      document.body.setAttribute('data-ready', 'true')
    }, 2000) // Wait for animations to complete
  }, [searchParams])

  if (!firmData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white">Loading dashboard...</p>
      </div>
    )
  }

  const currentLogoId = getLogoIdFromFirmName(firmData.firmName)

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
      <div className="w-full max-w-[1560px] max-h-[850px] flex flex-col relative">
        <Header 
          onLogoChange={() => {}}
          onFirmNameChange={() => {}}
          currentFirmName={firmData.firmName}
          currentLogoId={currentLogoId}
          isStatic={true}
        />
        
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="lg:col-span-1 h-full">
              <PopularityLeaderboardStatic 
                currentLogoId={currentLogoId}
                currentFirmName={firmData.firmName}
                firmData={firmData}
                competitors={competitors}
                isStatic={true}
              />
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6 h-full">
              <div className="h-[100%]">
                <RevenueCard 
                  previousWeek={firmData.revenuePrevious}
                  currentWeek={firmData.revenueCurrent}
                  isStatic={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <TrafficCard 
                  previousWeek={firmData.visitsAzulPrevious}
                  currentWeek={firmData.trafficCurrent}
                  cfdShareValue={firmData.cfdShare}
                  isStatic={true}
                />
                <FavoriteCard 
                  previousWeek={firmData.visitsPinkPrevious}
                  currentWeek={firmData.visitsPinkCurrent}
                  favoritesAdded={firmData.favoritesAdded}
                  favoritesChange={firmData.favoritesChange}
                  currentPosition={firmData.currentPosition}
                  previousPosition={firmData.previousPosition}
                  isStatic={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}