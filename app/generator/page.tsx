"use client"

import { useState, useEffect } from 'react'
import DashboardGeneratorReal from '@/components/DashboardGeneratorReal'
import DashboardGeneratorSimple from '@/components/DashboardGeneratorSimple'
import GeneratedDashboards from '@/components/GeneratedDashboards'
import { GeneratedDashboard } from '@/types/dashboard'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

export default function GeneratorPage() {
  const [generatedDashboards, setGeneratedDashboards] = useState<GeneratedDashboard[]>([])
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Detect if we're in production
    setIsProduction(
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    )
  }, [])

  const handleGenerationComplete = (dashboards: GeneratedDashboard[]) => {
    setGeneratedDashboards(dashboards)
  }

  return (
    <main 
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#100E0F'
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Generator</h1>
                <p className="text-gray-400 mt-1">
                  Generate dashboard images from CSV data automatically
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Generator */}
          <div className="space-y-6">
            {isProduction ? (
              <DashboardGeneratorSimple
                onGenerationComplete={handleGenerationComplete}
              />
            ) : (
              <DashboardGeneratorReal
                onGenerationComplete={handleGenerationComplete}
              />
            )}
          </div>

          {/* Right Column - Generated Dashboards */}
          <div>
            <GeneratedDashboards
              dashboards={generatedDashboards}
            />
          </div>
        </div>
      </div>
    </main>
  )
}