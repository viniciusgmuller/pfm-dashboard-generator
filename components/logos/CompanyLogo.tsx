"use client"

import React from 'react'
import { getLogoById } from '@/data/logoData'

interface CompanyLogoProps {
  logoId: string
  className?: string
  size?: number
  fallbackText?: string
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ 
  logoId, 
  className = '', 
  size = 48,
  fallbackText = 'FP'
}) => {
  const logoData = getLogoById(logoId)
  
  // Se não encontrar o logo, renderiza um placeholder
  if (!logoData) {
    return (
      <div 
        className={`bg-blue-600 rounded-lg flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold text-xl">{fallbackText}</span>
      </div>
    )
  }

  return (
    <div 
      className={`rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={`/logos/${encodeURIComponent(logoData.filename)}`} 
        alt={logoData.name}
        className="w-full h-full object-contain"
        onError={(e) => {
          console.log(`Failed to load logo: /logos/${logoData.filename}`)
          // Fallback se a imagem não carregar
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const fallback = document.createElement('div')
          fallback.className = 'w-full h-full bg-blue-600 rounded-lg flex items-center justify-center'
          fallback.innerHTML = `<span class="text-white font-bold text-xl">${fallbackText}</span>`
          target.parentNode?.appendChild(fallback)
        }}
      />
    </div>
  )
}

export default CompanyLogo