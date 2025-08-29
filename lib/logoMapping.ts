// Centralized logo mapping for firm names to logo IDs

export const getLogoIdFromFirmName = (firmName: string): string => {
  // Normalize firm name for matching
  const normalized = firmName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
  
  const nameMap: { [key: string]: string } = {
    // Direct matches from CSV data
    'fundingpips': 'fundingpips',
    'the5ers': 'the5ers',
    'e8markets': 'e8markets',
    'alphacapital': 'alphacapital',
    'fundednext': 'fundednext',
    'ftmo': 'ftmo',
    'maven': 'maven',
    'oandaproptrader': 'oandaprop',
    'toponetrader': 'toponetrader',
    'fortraders': 'fortraders',
    'brightfunded': 'brightfunded',
    'breakout': 'breakoutprop',
    'goatfundedtrader': 'goatfunded',
    'aquafunded': 'aquafunded',
    'seacrestfunded': 'seacrestfunded',
    'qtfunded': 'qtfunded',
    'citytradersimperium': 'citytraders',
    'fundingtraders': 'fundingtrader',
    'fundedtradingplus': 'fundedtradingplus',
    'blueberryfunded': 'blueberry',
    'instantfunding': 'instantfunding',
    'fintokei': 'fintokei',
    'blueguardian': 'blueguardian',
    
    // Alternative spellings and variations
    'the5': 'the5ers',
    'e8': 'e8markets',
    'oanda': 'oandaprop',
    'cti': 'citytraders',
    'goat': 'goatfunded',
    'qt': 'qtfunded',
    'blueberry': 'blueberry',
    'funding': 'fundingpips',
    'pips': 'fundingpips',
    
    // Futures firms mapping
    'myfundedfutures': 'myfundedfutures',
    'topstep': 'topstep',
    'alphafutures': 'alphafutures',
    'toponefutures': 'toponefutures',
    'fundingticks': 'fundingticks',
    'fundednextfutures': 'fundednextfutures',
    'apextraderfunding': 'apextrader',
    'apextrader': 'apextrader',
    'aquafutures': 'aquafutures',
    'takeprofittrader': 'takeprofittrader',
    'tradeify': 'tradeify',
    'blueguardianfutures': 'blueguardianfutures',
    'earn2trade': 'earn2trade',
    'thetradingpit': 'thetradingpit',
    'tradeday': 'tradeday',
    'traderslaunch': 'traderslaunch',
  }
  
  // Try direct match first
  if (nameMap[normalized]) {
    return nameMap[normalized]
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(nameMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }
  
  console.warn(`Logo not found for firm: "${firmName}" (normalized: "${normalized}"), using default`)
  
  // Default fallback
  return 'fundingpips'
}

// Test function to verify mappings
export const testLogoMappings = () => {
  const testNames = [
    'FundingPips',
    'The5ers',
    'E8 Markets',
    'Alpha Capital',
    'FundedNext',
    'FTMO',
    'Maven',
    'OANDA Prop Trader',
    'Top One Trader',
    'For Traders',
    'BrightFunded',
    'Breakout',
    'Goat Funded Trader',
    'AquaFunded',
    'SeacrestFunded',
    'QT Funded',
    'City Traders Imperium',
    'Funding Traders',
    'FundedTrading Plus',
    'Blueberry Funded'
  ]
  
  console.log('Logo Mapping Test Results:')
  testNames.forEach(name => {
    const logoId = getLogoIdFromFirmName(name)
    console.log(`${name} -> ${logoId}`)
  })
}