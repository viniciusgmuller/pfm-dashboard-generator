import PopularityLeaderboard from '@/components/PopularityLeaderboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Prop Firm Analytics
          </h1>
          <p className="text-gray-400">
            Track the popularity rankings of the top prop firms in the market
          </p>
        </div>
        
        <PopularityLeaderboard />
        
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Data is updated in real-time</p>
          <p className="mt-1">Metrics based on favorites, revenue and monthly traffic</p>
        </div>
      </div>
    </main>
  )
}