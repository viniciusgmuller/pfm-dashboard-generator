"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Play, Download, Loader2 } from 'lucide-react'
import { getContextualRanking } from '@/lib/csv-utils'
import { parse } from 'csv-parse/browser/esm/sync'
import { GeneratedDashboard, FirmData } from '@/types/dashboard'
import html2canvas from 'html2canvas'

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
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    current: '',
    status: 'idle' as 'idle' | 'processing' | 'completed' | 'error',
    error: ''
  })
  const [generatedDashboards, setGeneratedDashboards] = useState<GeneratedDashboard[]>([])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCsvContent(content)
        try {
          const parsedFirms = parseCSVContent(content)
          setFirms(parsedFirms)
          setProgress(prev => ({ ...prev, total: parsedFirms.length }))
        } catch (error) {
          console.error('Error parsing CSV:', error)
          setProgress(prev => ({ 
            ...prev, 
            status: 'error', 
            error: 'Failed to parse CSV file' 
          }))
        }
      }
      reader.readAsText(file)
    }
  }, [])

  const generateDashboardForFirm = async (
    firm: FirmData, 
    competitors: FirmData[],
    index: number,
    total: number
  ): Promise<GeneratedDashboard | null> => {
    try {
      // Open dashboard in a new tab/window for capture
      const firmDataParam = encodeURIComponent(JSON.stringify(firm))
      const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
      const dashboardUrl = `/dashboard/${firm.firmName.replace(/\s+/g, '-').toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
      
      // Create a temporary window for rendering
      const popup = window.open(dashboardUrl, '_blank', 'width=1560,height=850')
      
      if (!popup) {
        throw new Error('Failed to open popup window')
      }

      // Wait for the dashboard to be ready
      await new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 30 // 30 seconds max

        const checkReady = setInterval(() => {
          attempts++
          
          if (attempts > maxAttempts) {
            clearInterval(checkReady)
            reject(new Error('Timeout waiting for dashboard to be ready'))
            return
          }

          try {
            if (popup.document && popup.document.body.getAttribute('data-ready') === 'true') {
              clearInterval(checkReady)
              resolve(true)
            }
          } catch (e) {
            // Cross-origin or access issues, continue waiting
          }
        }, 1000)
      })

      // Additional wait for animations
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Capture the popup content
      const canvas = await html2canvas(popup.document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false
      } as any)

      // Close the popup
      popup.close()

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95)
      })

      // Upload to server
      const formData = new FormData()
      formData.append('image', blob)
      formData.append('firmName', firm.firmName)
      formData.append('index', index.toString())
      formData.append('total', total.toString())

      const response = await fetch('/api/generate-dashboard-real', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.dashboard
      }

      return null
    } catch (error) {
      console.error(`Error generating dashboard for ${firm.firmName}:`, error)
      return null
    }
  }

  const startGeneration = useCallback(async () => {
    if (firms.length === 0) return

    setIsGenerating(true)
    setProgress({
      total: firms.length,
      completed: 0,
      current: '',
      status: 'processing',
      error: ''
    })
    setGeneratedDashboards([])

    const dashboards: GeneratedDashboard[] = []

    for (let i = 0; i < firms.length; i++) {
      const firm = firms[i]
      
      setProgress(prev => ({
        ...prev,
        current: firm.firmName,
        completed: i
      }))

      try {
        const competitors = getContextualRanking(firms, firm, 3, 1)
        const dashboard = await generateDashboardForFirm(firm, competitors, i, firms.length)
        
        if (dashboard) {
          dashboards.push(dashboard)
          setGeneratedDashboards([...dashboards])
        }
      } catch (error) {
        console.error(`Error processing ${firm.firmName}:`, error)
        // Continue with next firm instead of stopping
      }

      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setProgress(prev => ({
      ...prev,
      completed: firms.length,
      status: 'completed',
      current: 'All dashboards generated!'
    }))

    setIsGenerating(false)
    
    if (onGenerationComplete) {
      onGenerationComplete(dashboards)
    }
  }, [firms, onGenerationComplete])

  const downloadAll = useCallback(() => {
    generatedDashboards.forEach(dashboard => {
      const link = document.createElement('a')
      link.href = dashboard.url
      link.download = dashboard.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }, [generatedDashboards])

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
              <Badge variant="destructive">{progress.error}</Badge>
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