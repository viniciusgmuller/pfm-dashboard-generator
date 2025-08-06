import Header from '@/components/Header'
import PopularityLeaderboard from '@/components/PopularityLeaderboard'
import RevenueCard from '@/components/RevenueCard'
import TrafficCard from '@/components/TrafficCard'
import FavoriteCard from '@/components/FavoriteCard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex flex-col items-center justify-center">
      <div className="w-full max-w-[1560px] max-h-[850px] flex flex-col">
        <Header />
        
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="lg:col-span-1 h-full">
              <PopularityLeaderboard />
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6 h-full">
              <div className="flex-1">
                <RevenueCard />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <TrafficCard />
                <FavoriteCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}