"use client"

import React, { useState } from 'react'
import { logoLibrary, searchLogos, LogoData } from '@/data/logoData'
import { Search, X } from 'lucide-react'
import CompanyLogo from './CompanyLogo'

interface LogoSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (logoId: string) => void
  currentLogoId: string
}

const LogoSelector: React.FC<LogoSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentLogoId 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLogos, setFilteredLogos] = useState(logoLibrary)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredLogos(logoLibrary)
    } else {
      setFilteredLogos(searchLogos(query))
    }
  }

  const handleLogoSelect = (logoId: string) => {
    onSelect(logoId)
    onClose()
    setSearchQuery('')
    setFilteredLogos(logoLibrary)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Select Company Logo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logos..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Logo Grid */}
        <div className="p-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-6 gap-4">
            {filteredLogos.map((logo) => (
              <button
                key={logo.id}
                onClick={() => handleLogoSelect(logo.id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-700 ${
                  currentLogoId === logo.id 
                    ? 'bg-blue-600/20 border-2 border-blue-500' 
                    : 'border-2 border-transparent'
                }`}
                title={logo.name}
              >
                <CompanyLogo
                  logoId={logo.id}
                  size={48}
                  fallbackText={logo.name.substring(0, 2).toUpperCase()}
                />
                <span className="text-xs text-gray-300 mt-2 text-center truncate w-full">
                  {logo.name}
                </span>
              </button>
            ))}
          </div>

          {filteredLogos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No logos found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-750">
          <p className="text-sm text-gray-400 text-center">
            {filteredLogos.length} of {logoLibrary.length} logos
          </p>
        </div>
      </div>
    </div>
  )
}

export default LogoSelector