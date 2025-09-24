"use client"

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Play, Download, Loader2, Calendar, Users, Settings, AlertCircle } from 'lucide-react'
import { getContextualRanking } from '@/lib/csv-utils'
import { parse } from 'csv-parse/browser/esm/sync'
import { GeneratedDashboard, FirmData } from '@/types/dashboard'
import { DashboardCategory } from '@/lib/globalConfig'

interface DashboardGeneratorSimpleProps {
  onGenerationComplete?: (dashboards: GeneratedDashboard[]) => void
}

function parseCSVContent(csvContent: string): FirmData[] {
  const records = parse(csvContent, {
    columns: false,
    skip_empty_lines: true,
    from_line: 2, // Skip header row
  })

  return records
    .filter((row: string[]) => row[0] && row[0].trim() !== '')
    .map((row: string[]) => {
      const parseMoney = (value: string): number => {
        return parseInt(value.replace(/[$,]/g, '')) || 0
      }

      const parsePercentage = (value: string): number => {
        return parseFloat(value.replace(/%/g, '')) || 0
      }

      const parseNumber = (value: string): number => {
        return parseInt(value.replace(/,/g, '')) || 0
      }

      return {
        firmName: row[0].trim(),
        previousPosition: parseNumber(row[1]),
        currentPosition: parseNumber(row[2]),
        revenuePrevious: parseMoney(row[3]),
        revenueCurrent: parseMoney(row[4]),
        revenueChange: parsePercentage(row[5]),
        visitsPinkPrevious: parseNumber(row[6]),
        visitsPinkCurrent: parseNumber(row[7]),
        favoritesAdded: parseNumber(row[8]),
        favoritesChange: parsePercentage(row[9]),
        visitsAzulPrevious: parseNumber(row[10]),
        trafficCurrent: parseNumber(row[11]),
        trafficIncrease: parsePercentage(row[12]),
        cfdShare: parsePercentage(row[13]),
      }
    })
}

export default function DashboardGeneratorSimple({ onGenerationComplete }: DashboardGeneratorSimpleProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [firms, setFirms] = useState<FirmData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Configuration states
  const [currentWeek, setCurrentWeek] = useState<string>('')
  const [totalVisits, setTotalVisits] = useState<number>(119734)
  const [category, setCategory] = useState<DashboardCategory>('prop-trading')
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    current: '',
    status: 'idle' as 'idle' | 'processing' | 'completed' | 'error',
    error: ''
  })
  const [generatedDashboards, setGeneratedDashboards] = useState<GeneratedDashboard[]>([])

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboard-generator-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setCurrentWeek(config.currentWeek || '')
        setTotalVisits(config.totalVisits || 119734)
        setCategory(config.category || 'prop-trading')
      } catch (error) {
        console.error('Error loading saved configuration:', error)
      }
    }
  }, [])

  // Auto-detect current week based on today's date
  useEffect(() => {
    if (!currentWeek) {
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }

      setCurrentWeek(`${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`)
    }
  }, [currentWeek])

  // Save configuration to localStorage when changed
  useEffect(() => {
    const config = { currentWeek, totalVisits, category }
    localStorage.setItem('dashboard-generator-config', JSON.stringify(config))
  }, [currentWeek, totalVisits, category])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    // Reset previous state
    setProgress({
      total: 0,
      completed: 0,
      current: '',
      status: 'idle',
      error: ''
    })

    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string

      if (!content) {
        setProgress(prev => ({
          ...prev,
          status: 'error',
          error: 'File appears to be empty'
        }))
        return
      }

      setCsvContent(content)
      try {
        const parsedFirms = parseCSVContent(content)

        if (parsedFirms.length === 0) {
          setProgress(prev => ({
            ...prev,
            status: 'error',
            error: 'No valid data found in CSV file'
          }))
          return
        }

        setFirms(parsedFirms)
        setProgress(prev => ({
          ...prev,
          total: parsedFirms.length,
          status: 'idle'
        }))
      } catch (error) {
        console.error('Error parsing CSV:', error)
        setProgress(prev => ({
          ...prev,
          status: 'error',
          error: 'Failed to parse CSV file. Please check the format and try again.'
        }))
      }
    }

    reader.readAsText(file)
  }, [])

  const startGeneration = useCallback(async () => {
    if (firms.length === 0) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'No firms data available. Please upload a CSV file first.'
      }))
      return
    }

    setIsGenerating(true)
    setProgress({
      total: firms.length,
      completed: 0,
      current: 'Checking available generation methods...',
      status: 'processing',
      error: ''
    })
    setGeneratedDashboards([])

    try {
      // Check if Railway worker is available
      const workerUrl = process.env.NEXT_PUBLIC_RAILWAY_WORKER_URL
      let useWorker = false

      if (workerUrl) {
        try {
          const healthResponse = await fetch(`${workerUrl}/health`, {
            method: 'GET',
            timeout: 5000
          })
          useWorker = healthResponse.ok

          if (useWorker) {
            setProgress(prev => ({
              ...prev,
              current: 'Railway worker detected - using screenshot generation!'
            }))
          }
        } catch (error) {
          console.log('Railway worker not available, using fallback mode')
        }
      }

      if (useWorker) {
        // Use Railway worker for real screenshots
        const formData = new FormData()
        formData.append('csv', csvContent)
        formData.append('currentWeek', currentWeek)
        formData.append('totalVisits', totalVisits.toString())
        formData.append('category', category)

        const response = await fetch('/api/generate-railway', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Railway generation failed: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Failed to read response stream')
        }

        const decoder = new TextDecoder()
        const dashboards: GeneratedDashboard[] = []
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                switch (data.type) {
                  case 'start':
                    setProgress(prev => ({
                      ...prev,
                      total: data.total,
                      current: data.message
                    }))
                    break

                  case 'progress':
                    setProgress(prev => ({
                      ...prev,
                      completed: data.completed,
                      current: data.message
                    }))
                    break

                  case 'dashboard':
                    if (data.dashboard) {
                      const dashboard = data.dashboard
                      const byteCharacters = atob(dashboard.data)
                      const byteNumbers = new Array(byteCharacters.length)
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i)
                      }
                      const byteArray = new Uint8Array(byteNumbers)
                      const blob = new Blob([byteArray], { type: 'image/png' })
                      const url = URL.createObjectURL(blob)

                      const generatedDashboard: GeneratedDashboard = {
                        firmName: dashboard.firmName,
                        filename: dashboard.filename,
                        url,
                        blob,
                        timestamp: Date.now()
                      }

                      dashboards.push(generatedDashboard)
                      setGeneratedDashboards(prev => [...prev, generatedDashboard])

                      setProgress(prev => ({
                        ...prev,
                        completed: data.completed
                      }))
                    }
                    break

                  case 'complete':
                    setProgress(prev => ({
                      ...prev,
                      completed: data.total,
                      status: 'completed',
                      current: data.message
                    }))

                    if (onGenerationComplete && dashboards.length > 0) {
                      onGenerationComplete(dashboards)
                    }
                    break

                  case 'error':
                    setProgress(prev => ({
                      ...prev,
                      status: 'error',
                      error: data.details || data.message || 'Generation failed'
                    }))
                    break
                }
              } catch (error) {
                console.error('Error parsing SSE data:', error)
              }
            }
          }
        }

      } else {
        // Fallback: generate dashboard URLs only
        setProgress(prev => ({
          ...prev,
          current: 'Railway worker not available - generating dashboard links...'
        }))

        const dashboards: GeneratedDashboard[] = []

        for (let i = 0; i < firms.length; i++) {
          const firm = firms[i]

          setProgress(prev => ({
            ...prev,
            completed: i,
            current: `Processing ${firm.firmName} (${i + 1}/${firms.length})...`
          }))

          // Get contextual ranking
          const competitors = getContextualRanking(firms, firm, 3, 1)

          // Create dashboard URL
          const firmSlug = firm.firmName.replace(/\s+/g, '-').toLowerCase()
          const firmDataParam = encodeURIComponent(JSON.stringify(firm))
          const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
          const configParam = encodeURIComponent(JSON.stringify({
            currentWeek,
            totalVisits,
            category
          }))

          const dashboardUrl = `/dashboard/${firmSlug}?data=${firmDataParam}&competitors=${competitorsParam}&category=${category}&config=${configParam}`

          const dashboard: GeneratedDashboard = {
            firmName: firm.firmName,
            filename: `${firm.firmName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`,
            url: dashboardUrl,
            timestamp: Date.now()
          }

          dashboards.push(dashboard)
          setGeneratedDashboards(prev => [...prev, dashboard])

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        setProgress(prev => ({
          ...prev,
          completed: firms.length,
          status: 'completed',
          current: `Successfully prepared ${dashboards.length} dashboard links!`
        }))

        if (onGenerationComplete) {
          onGenerationComplete(dashboards)
        }
      }

    } catch (error) {
      console.error('Error during generation:', error)
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }))
    } finally {
      setIsGenerating(false)
    }
  }, [firms, csvContent, currentWeek, totalVisits, category, onGenerationComplete])

  return (
    <Card className="bg-[#1a1a1a]/90 border-[#2a2a2a] backdrop-blur-sm">
      <CardHeader className="border-b border-[#2a2a2a]">
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Dashboard Generator
        </CardTitle>
        <CardDescription className="text-gray-400">
          Prepare dashboard links from CSV data
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Warning for production */}
        {typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-400">Production Mode</p>
                <p className="text-xs text-gray-300">
                  Dashboard screenshots are not available in production. Dashboard links will be generated instead.
                  For full screenshot functionality, please run this application locally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center hover:border-[#3a3a3a] transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload-simple"
            disabled={isGenerating}
          />
          <label
            htmlFor="csv-upload-simple"
            className="cursor-pointer space-y-2"
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            {csvFile ? (
              <div className="space-y-1">
                <p className="text-white font-medium">{csvFile.name}</p>
                <p className="text-sm text-gray-400">
                  {firms.length} firms ready
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-white font-medium">Click to upload CSV file</p>
                <p className="text-sm text-gray-400">or drag and drop</p>
              </div>
            )}
          </label>
        </div>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Configuration */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Current Week
            </label>
            <input
              type="text"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(e.target.value)}
              placeholder="Sep 19 - Sep 25"
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>

          {/* Total Visits Configuration */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Visits
            </label>
            <input
              type="number"
              value={totalVisits}
              onChange={(e) => setTotalVisits(parseInt(e.target.value) || 0)}
              placeholder="119734"
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              disabled={isGenerating}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DashboardCategory)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              disabled={isGenerating}
            >
              <option value="prop-trading">Prop Trading</option>
              <option value="futures">Futures</option>
            </select>
          </div>
        </div>

        {/* Progress */}
        {(isGenerating || progress.status !== 'idle') && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-[#2a2a2a] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
            {progress.current && (
              <p className="text-xs text-gray-400">{progress.current}</p>
            )}
          </div>
        )}

        {/* Generated Dashboards */}
        {generatedDashboards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Generated Dashboard Links:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {generatedDashboards.map((dashboard, index) => (
                <a
                  key={index}
                  href={dashboard.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-[#2a2a2a]/50 rounded hover:bg-[#3a3a3a]/50 transition-colors"
                >
                  <span className="text-xs text-blue-400">{dashboard.firmName}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={startGeneration}
          disabled={firms.length === 0 || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Generate Dashboard Links
            </>
          )}
        </button>

        {/* Success Message */}
        {progress.status === 'completed' && generatedDashboards.length > 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm font-medium">
              ✅ Successfully generated {generatedDashboards.length} dashboard links!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click on the links above to view each dashboard.
            </p>
          </div>
        )}

        {/* Error Display */}
        {progress.status === 'error' && progress.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-sm font-medium">Error:</span>
              <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono flex-1">
                {progress.error}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}