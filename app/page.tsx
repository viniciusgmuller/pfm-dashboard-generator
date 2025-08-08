import Header from '@/components/Header'
import PopularityLeaderboard from '@/components/PopularityLeaderboard'
import RevenueCard from '@/components/RevenueCard'
import TrafficCard from '@/components/TrafficCard'
import FavoriteCard from '@/components/FavoriteCard'

export default function Home() {
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
        <Header />
        
        <div className="p-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="lg:col-span-1 h-full">
              <PopularityLeaderboard />
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
      </div>
    </main>
  )
}