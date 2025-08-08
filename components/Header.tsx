"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CompanyLogo, LogoSelector } from '@/components/logos'
import { getLogoById } from '@/data/logoData'

interface HeaderProps {
  onLogoChange?: (logoId: string) => void
  onFirmNameChange?: (firmName: string) => void
}

const Header: React.FC<HeaderProps> = ({ onLogoChange, onFirmNameChange }) => {
  const [firmName, setFirmName] = useState('Funding Pips')
  const [currentWeek, setCurrentWeek] = useState('Jun 28 - Aug 3')
  const [pfmVisitors, setPfmVisitors] = useState(258351)
  const [currentLogoId, setCurrentLogoId] = useState('fundingpips')
  const [editingFirmName, setEditingFirmName] = useState(false)
  const [editingCurrentWeek, setEditingCurrentWeek] = useState(false)
  const [editingPfmVisitors, setEditingPfmVisitors] = useState(false)
  const [showLogoSelector, setShowLogoSelector] = useState(false)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleFirmNameEdit = (value: string) => {
    setFirmName(value)
    onFirmNameChange?.(value)
  }

  const handleCurrentWeekEdit = (value: string) => {
    setCurrentWeek(value)
  }

  const handlePfmVisitorsEdit = (value: string) => {
    const numValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    setPfmVisitors(numValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent, setEditing: (value: boolean) => void) => {
    if (e.key === 'Enter') {
      setEditing(false)
    }
    if (e.key === 'Escape') {
      setEditing(false)
    }
  }

  const handleLogoChange = (logoId: string) => {
    setCurrentLogoId(logoId)
    const logoData = getLogoById(logoId)
    if (logoData) {
      setFirmName(logoData.name)
      onFirmNameChange?.(logoData.name)
    }
    onLogoChange?.(logoId)
  }
  return (
    <div 
      className="flex items-center justify-between p-6 mb-0.5"
    
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowLogoSelector(true)}
            title="Click to change logo"
          >
            <CompanyLogo 
              logoId={currentLogoId} 
              size={48}
              fallbackText="FP"
            />
          </div>
          <div>
            {editingFirmName ? (
              <input
                type="text"
                value={firmName}
                onChange={(e) => handleFirmNameEdit(e.target.value)}
                onBlur={() => setEditingFirmName(false)}
                onKeyDown={(e) => handleKeyPress(e, setEditingFirmName)}
                className="bg-transparent text-2xl font-bold text-white outline-none border-none w-full"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-bold text-white cursor-pointer hover:bg-gray-700/20 px-2 py-1 rounded transition-colors -ml-2"
                onClick={() => setEditingFirmName(true)}
                title="Click to edit"
              >
                {firmName}
              </h1>
            )}
            <p className="text-gray-400 text-sm">Weekly Report</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-left">
          <div className="text-xs text-white mb-0.25">Current Week:</div>
          <div className="text-lg font-bold text-white">
            {editingCurrentWeek ? (
              <input
                type="text"
                value={currentWeek}
                onChange={(e) => handleCurrentWeekEdit(e.target.value)}
                onBlur={() => setEditingCurrentWeek(false)}
                onKeyDown={(e) => handleKeyPress(e, setEditingCurrentWeek)}
                className="bg-transparent text-lg font-bold text-white outline-none border-none text-left"
                autoFocus
              />
            ) : (
              <span 
                className="cursor-pointer hover:bg-gray-700/20 px-2 py-1 rounded transition-colors"
                onClick={() => setEditingCurrentWeek(true)}
                title="Click to edit"
              >
                {currentWeek}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-xs text-white mb-0.25">PFM Visitors this Week:</div>
            <div className="text-lg font-bold text-white flex items-center gap-0">
              <svg width="16" height="16" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.9681 0.222107C12.8084 0.222107 9.71959 1.15908 7.09236 2.91453C4.46514 4.66999 2.41747 7.16508 1.20829 10.0843C-0.000890387 13.0035 -0.317267 16.2157 0.299167 19.3148C0.915601 22.4138 2.43716 25.2604 4.67143 27.4947C6.9057 29.729 9.75233 31.2505 12.8514 31.8669C15.9504 32.4834 19.1626 32.167 22.0818 30.9578C25.001 29.7486 27.4961 27.701 29.2516 25.0738C31.007 22.4465 31.944 19.3578 31.944 16.198C31.9391 11.9624 30.2544 7.90174 27.2594 4.90673C24.2644 1.91172 20.2037 0.226986 15.9681 0.222107ZM29.4862 16.198C29.4872 17.4447 29.3151 18.6855 28.9746 19.8848H23.0589C23.4358 17.4414 23.4358 14.9547 23.0589 12.5113H28.9746C29.3151 13.7106 29.4872 14.9513 29.4862 16.198ZM11.9741 22.3426H19.9621C19.1751 24.9212 17.809 27.2856 15.9681 29.2552C14.1279 27.2851 12.7619 24.9208 11.9741 22.3426ZM11.375 19.8848C10.9531 17.445 10.9531 14.951 11.375 12.5113H20.5735C20.9954 14.951 20.9954 17.445 20.5735 19.8848H11.375ZM2.45003 16.198C2.44896 14.9513 2.62112 13.7106 2.96156 12.5113H8.87726C8.50038 14.9547 8.50038 17.4414 8.87726 19.8848H2.96156C2.62112 18.6855 2.44896 17.4447 2.45003 16.198ZM19.9621 10.0534H11.9741C12.7611 7.47488 14.1272 5.1104 15.9681 3.14078C17.8083 5.11092 19.1743 7.47522 19.9621 10.0534ZM28.0007 10.0534H22.529C21.8393 7.52326 20.677 5.14649 19.1034 3.04861C21.0047 3.50535 22.7847 4.36782 24.3215 5.57689C25.8583 6.78595 27.1155 8.31303 28.0069 10.0534H28.0007ZM12.8328 3.04861C11.2592 5.14649 10.0969 7.52326 9.40723 10.0534H3.92933C4.82072 8.31303 6.07789 6.78595 7.61468 5.57689C9.15147 4.36782 10.9315 3.50535 12.8328 3.04861ZM3.92933 22.3426H9.40723C10.0969 24.8728 11.2592 27.2495 12.8328 29.3474C10.9315 28.8907 9.15147 28.0282 7.61468 26.8191C6.07789 25.6101 4.82072 24.083 3.92933 22.3426ZM19.1034 29.3474C20.677 27.2495 21.8393 24.8728 22.529 22.3426H28.0069C27.1155 24.083 25.8583 25.6101 24.3215 26.8191C22.7847 28.0282 21.0047 28.8907 19.1034 29.3474Z" fill="url(#paint0_linear_globe)"/>
                <defs>
                  <linearGradient id="paint0_linear_globe" x1="31.944" y1="32.1739" x2="-0.0078125" y2="0.222107" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9061F9"/>
                    <stop offset="1" stopColor="#2566F2"/>
                  </linearGradient>
                </defs>
              </svg>
              {editingPfmVisitors ? (
                <input
                  type="text"
                  value={formatNumber(pfmVisitors)}
                  onChange={(e) => handlePfmVisitorsEdit(e.target.value)}
                  onBlur={() => setEditingPfmVisitors(false)}
                  onKeyDown={(e) => handleKeyPress(e, setEditingPfmVisitors)}
                  className="bg-transparent text-lg font-bold text-white outline-none border-none w-24"
                  autoFocus
                />
              ) : (
                <span 
                  className="cursor-pointer hover:bg-gray-700/20 px-2 py-1 rounded transition-colors"
                  onClick={() => setEditingPfmVisitors(true)}
                  title="Click to edit"
                >
                  {formatNumber(pfmVisitors)}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Logo Selector Modal */}
      <LogoSelector
        isOpen={showLogoSelector}
        onClose={() => setShowLogoSelector(false)}
        onSelect={handleLogoChange}
        currentLogoId={currentLogoId}
      />
    </div>
  )
}

export default Header