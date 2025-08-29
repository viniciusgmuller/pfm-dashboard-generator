"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Trash2, Grid, List, Search, Filter } from 'lucide-react'
import { GeneratedDashboard } from '@/types/dashboard'

interface GeneratedDashboardsProps {
  dashboards: GeneratedDashboard[]
  onRefresh?: () => void
}

export default function GeneratedDashboards({ dashboards, onRefresh }: GeneratedDashboardsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDashboards, setSelectedDashboards] = useState<Set<string>>(new Set())
  const [previewDashboard, setPreviewDashboard] = useState<GeneratedDashboard | null>(null)

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.firmName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSelection = (firmName: string) => {
    const newSelection = new Set(selectedDashboards)
    if (newSelection.has(firmName)) {
      newSelection.delete(firmName)
    } else {
      newSelection.add(firmName)
    }
    setSelectedDashboards(newSelection)
  }

  const downloadSelected = () => {
    selectedDashboards.forEach(firmName => {
      const dashboard = dashboards.find(d => d.firmName === firmName)
      if (dashboard) {
        const link = document.createElement('a')
        link.href = dashboard.url
        link.download = dashboard.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }

  const downloadSingle = (dashboard: GeneratedDashboard) => {
    const link = document.createElement('a')
    link.href = dashboard.url
    link.download = dashboard.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (dashboards.length === 0) {
    return (
      <Card className="bg-[#1a1a1a]/90 border-[#2a2a2a] backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Grid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">No dashboards generated yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Upload a CSV file to generate dashboards
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-[#1a1a1a]/90 border-[#2a2a2a] backdrop-blur-sm">
        <CardHeader className="border-b border-[#2a2a2a]">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Generated Dashboards
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                {dashboards.length} dashboards available
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4 text-gray-400" />
                ) : (
                  <Grid className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {selectedDashboards.size > 0 && (
                <button
                  onClick={downloadSelected}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download ({selectedDashboards.size})
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search dashboards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dashboard Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDashboards.map((dashboard) => (
                <div
                  key={dashboard.firmName}
                  className="relative group"
                >
                  <div className="bg-[#2a2a2a] rounded-lg overflow-hidden border border-[#3a3a3a] hover:border-blue-500/50 transition-all">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-[#1a1a1a] relative">
                      <img
                        src={dashboard.url}
                        alt={dashboard.firmName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-dashboard.png'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewDashboard(dashboard)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => downloadSingle(dashboard)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {dashboard.firmName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {dashboard.size && formatFileSize(dashboard.size)}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedDashboards.has(dashboard.firmName)}
                          onChange={() => toggleSelection(dashboard.firmName)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDashboards.map((dashboard) => (
                <div
                  key={dashboard.firmName}
                  className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDashboards.has(dashboard.firmName)}
                      onChange={() => toggleSelection(dashboard.firmName)}
                    />
                    <div>
                      <p className="text-white font-medium">{dashboard.firmName}</p>
                      <p className="text-xs text-gray-400">
                        {dashboard.filename} • {dashboard.size && formatFileSize(dashboard.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDashboard(dashboard)}
                      className="p-2 hover:bg-[#4a4a4a] rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => downloadSingle(dashboard)}
                      className="p-2 hover:bg-[#4a4a4a] rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewDashboard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewDashboard(null)}
        >
          <div
            className="bg-[#1a1a1a] rounded-lg max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#2a2a2a]">
              <h3 className="text-white font-medium">{previewDashboard.firmName}</h3>
              <button
                onClick={() => setPreviewDashboard(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewDashboard.url}
                alt={previewDashboard.firmName}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}