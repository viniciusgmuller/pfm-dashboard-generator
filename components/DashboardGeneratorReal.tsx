"use client"

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Play, Download, Loader2, Calendar, Users, Settings } from 'lucide-react'
import { getContextualRanking } from '@/lib/csv-utils'
import { parse } from 'csv-parse/browser/esm/sync'
import { GeneratedDashboard, FirmData } from '@/types/dashboard'
import { DashboardCategory } from '@/lib/globalConfig'

interface DashboardGeneratorRealProps {
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

export default function DashboardGeneratorReal({ onGenerationComplete }: DashboardGeneratorRealProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [firms, setFirms] = useState<FirmData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Configuration states
  const [currentWeek, setCurrentWeek] = useState<string>('')
  const [totalVisits, setTotalVisits] = useState<number>(119734)
  const [category, setCategory] = useState<DashboardCategory>('prop-trading')
  const [scale, setScale] = useState<number>(2)
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
        setScale(config.scale || 2)
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
    const config = { currentWeek, totalVisits, category, scale }
    localStorage.setItem('dashboard-generator-config', JSON.stringify(config))
  }, [currentWeek, totalVisits, category, scale])

  // Auto-detect category from CSV filename
  useEffect(() => {
    if (csvFile) {
      const filename = csvFile.name.toLowerCase()
      if (filename.includes('futures') || filename.includes('future')) {
        setCategory('futures')
        console.log('Detected futures category from filename:', filename)
      } else {
        setCategory('prop-trading')
        console.log('Detected prop-trading category from filename:', filename)
      }
    }
  }, [csvFile])

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

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'Please select a valid CSV file'
      }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'File size too large. Maximum 10MB allowed.'
      }))
      return
    }

    setCsvFile(file)
    const reader = new FileReader()

    reader.onerror = () => {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to read file. Please try again.'
      }))
    }

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

        // Validate required fields
        const invalidFirms: { firm: FirmData, issues: string[] }[] = []

        parsedFirms.forEach((firm, index) => {
          const issues: string[] = []

          if (!firm.firmName || firm.firmName.trim() === '') {
            issues.push('missing firm name')
          }
          if (firm.currentPosition <= 0) {
            issues.push('invalid current position')
          }
          if (firm.revenueCurrent < 0) {
            issues.push('invalid revenue')
          }
          if (isNaN(firm.currentPosition) || isNaN(firm.revenueCurrent)) {
            issues.push('non-numeric values')
          }

          if (issues.length > 0) {
            invalidFirms.push({ firm, issues })
          }
        })

        if (invalidFirms.length > 0) {
          const errorDetails = invalidFirms.slice(0, 3).map(({ firm, issues }, index) =>
            `Row ${index + 2}: "${firm.firmName || 'unnamed'}" - ${issues.join(', ')}`
          ).join('\n')

          const moreCount = invalidFirms.length > 3 ? `\n...and ${invalidFirms.length - 3} more` : ''

          setProgress(prev => ({
            ...prev,
            status: 'error',
            error: `${invalidFirms.length} firms have invalid data:\n${errorDetails}${moreCount}`
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

    // Validate configuration
    if (!currentWeek.trim()) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'Please specify the current week period'
      }))
      return
    }

    if (totalVisits <= 0) {
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: 'Total visits must be greater than 0'
      }))
      return
    }

    setIsGenerating(true)
    setProgress({
      total: firms.length,
      completed: 0,
      current: 'Sending data to server for generation...',
      status: 'processing',
      error: ''
    })
    setGeneratedDashboards([])

    try {
      // Prepare form data for API
      const formData = new FormData()
      formData.append('csv', csvContent)
      formData.append('currentWeek', currentWeek)
      formData.append('totalVisits', totalVisits.toString())
      formData.append('category', category)
      formData.append('scale', scale.toString())

      // Call the API endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Failed to generate dashboards')
      }

      const result = await response.json()

      if (!result.success || !result.dashboards || result.dashboards.length === 0) {
        throw new Error('No dashboards were generated')
      }

      // Convert base64 data to blobs and URLs for display/download
      const dashboards: GeneratedDashboard[] = []

      for (const dashboard of result.dashboards) {
        setProgress(prev => ({
          ...prev,
          current: `Processing ${dashboard.firmName}...`,
          completed: dashboards.length
        }))

        // Convert base64 to blob
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
      }

      const finalStatus = dashboards.length > 0 ? 'completed' : 'error'
      const statusMessage = dashboards.length > 0
        ? `Successfully generated ${dashboards.length} dashboards!`
        : 'Failed to generate any dashboards'

      setProgress(prev => ({
        ...prev,
        completed: firms.length,
        status: finalStatus,
        current: statusMessage,
        error: ''
      }))

      if (onGenerationComplete && dashboards.length > 0) {
        onGenerationComplete(dashboards)
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
  }, [firms, csvContent, currentWeek, totalVisits, category, scale, onGenerationComplete])

  const downloadAll = useCallback(async () => {
    if (generatedDashboards.length === 0) return

    // For multiple files, create individual downloads (ZIP would require additional library)
    for (const dashboard of generatedDashboards) {
      const link = document.createElement('a')
      link.href = dashboard.url
      link.download = dashboard.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }, [generatedDashboards])

  const downloadSingle = useCallback((dashboard: GeneratedDashboard) => {
    const link = document.createElement('a')
    link.href = dashboard.url
    link.download = dashboard.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return (
    <Card className="bg-[#1a1a1a]/90 border-[#2a2a2a] backdrop-blur-sm">
      <CardHeader className="border-b border-[#2a2a2a]">
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Dashboard Generator
        </CardTitle>
        <CardDescription className="text-gray-400">
          Generate dashboard images from CSV data
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center hover:border-[#3a3a3a] transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload-real"
            disabled={isGenerating}
          />
          <label
            htmlFor="csv-upload-real"
            className="cursor-pointer space-y-2"
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            {csvFile ? (
              <div className="space-y-1">
                <p className="text-white font-medium">{csvFile.name}</p>
                <p className="text-sm text-gray-400">
                  {firms.length} firms ready to generate
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

          {/* Scale/Quality Selection */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Quality
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              disabled={isGenerating}
            >
              <option value={1}>1x (Standard)</option>
              <option value={2}>2x (High Quality)</option>
              <option value={3}>3x (Ultra HD)</option>
            </select>
          </div>
        </div>

        {/* Data Preview */}
        {firms.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">Data Preview</h3>
              <Badge variant="outline" className="text-xs">
                {firms.length} firms loaded
              </Badge>
            </div>
            <div className="max-h-64 overflow-y-auto border border-[#2a2a2a] rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-[#2a2a2a] sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-gray-400">#</th>
                    <th className="p-2 text-left text-gray-400">Firm</th>
                    <th className="p-2 text-left text-gray-400">Rank</th>
                    <th className="p-2 text-left text-gray-400">Revenue</th>
                    <th className="p-2 text-left text-gray-400">Traffic</th>
                    <th className="p-2 text-left text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {firms.slice(0, 15).map((firm, index) => {
                    const isValid = firm.firmName && firm.firmName.trim() !== '' &&
                                    firm.currentPosition > 0 &&
                                    firm.revenueCurrent >= 0 &&
                                    !isNaN(firm.currentPosition) &&
                                    !isNaN(firm.revenueCurrent)

                    return (
                      <tr key={index} className={`border-t border-[#2a2a2a] hover:bg-[#2a2a2a]/30 ${
                        !isValid ? 'bg-red-500/10' : ''
                      }`}>
                        <td className="p-2 text-gray-400 font-mono">{index + 1}</td>
                        <td className={`p-2 font-medium ${
                          !firm.firmName || firm.firmName.trim() === '' ? 'text-red-400' : 'text-white'
                        }`}>
                          {firm.firmName || '(empty)'}
                        </td>
                        <td className={`p-2 ${
                          firm.currentPosition <= 0 || isNaN(firm.currentPosition) ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          #{firm.currentPosition || 'N/A'}
                          {firm.previousPosition !== firm.currentPosition && firm.previousPosition > 0 && (
                            <span className={`ml-1 text-xs ${
                              firm.currentPosition < firm.previousPosition ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {firm.currentPosition < firm.previousPosition ? '↑' : '↓'}
                            </span>
                          )}
                        </td>
                        <td className={`p-2 ${
                          firm.revenueCurrent < 0 || isNaN(firm.revenueCurrent) ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          ${firm.revenueCurrent?.toLocaleString() || 'N/A'}
                          {!isNaN(firm.revenueChange) && (
                            <span className={`ml-1 text-xs ${
                              firm.revenueChange > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {firm.revenueChange > 0 ? '+' : ''}{firm.revenueChange.toFixed(1)}%
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-gray-300">
                          {firm.trafficCurrent?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="p-2">
                          {isValid ? (
                            <span className="text-xs text-green-400">✓</span>
                          ) : (
                            <span className="text-xs text-red-400" title="Invalid data">✗</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {firms.length > 10 && (
                <div className="p-2 text-center border-t border-[#2a2a2a] bg-[#1a1a1a]">
                  <span className="text-xs text-gray-400">
                    ... and {firms.length - 10} more firms
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

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
              <div className="flex items-center gap-2">
                {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
                <p className="text-xs text-gray-400">
                  {isGenerating ? 'Generating:' : ''} {progress.current}
                </p>
              </div>
            )}
            {progress.status === 'error' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-sm font-medium">❌ Error:</span>
                  <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                    {progress.error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generated Dashboards Preview */}
        {generatedDashboards.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Generated Dashboards:</p>
            <div className="flex flex-wrap gap-2">
              {generatedDashboards.slice(-5).map((dashboard, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="text-xs border-green-500/30 text-green-400"
                >
                  {dashboard.firmName}
                </Badge>
              ))}
              {generatedDashboards.length > 5 && (
                <Badge 
                  variant="outline"
                  className="text-xs border-gray-500/30 text-gray-400"
                >
                  +{generatedDashboards.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={startGeneration}
            disabled={firms.length === 0 || isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Dashboards
              </>
            )}
          </button>
          {generatedDashboards.length > 0 && (
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#3a3a3a] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          )}
        </div>

        {/* Success Message */}
        {progress.status === 'completed' && generatedDashboards.length > 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm font-medium">
              ✅ Successfully generated {generatedDashboards.length} dashboard images!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Images are saved in /public/generated-dashboards/
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}