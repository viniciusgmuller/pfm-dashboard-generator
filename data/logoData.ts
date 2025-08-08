export interface LogoData {
  id: string
  name: string
  filename: string
  category?: string
}

export const logoLibrary: LogoData[] = [
  { id: 'fundingpips', name: 'Funding Pips', filename: 'Firms=Funding Pips.svg', category: 'prop-trading' },
  { id: 'ftmo', name: 'FTMO', filename: 'Firms=FTMO.svg', category: 'prop-trading' },
  { id: 'fxify', name: 'FXIFY', filename: 'Firms=FXIFY.svg', category: 'prop-trading' },
  { id: 'the5ers', name: 'The 5%ers', filename: 'Firms=The 5%ers.svg', category: 'prop-trading' },
  { id: 'instantfunding', name: 'Instant Funding', filename: 'Firms=Instant Funding.svg', category: 'prop-trading' },
  { id: 'blueguardian', name: 'Blue Guardian', filename: 'Firms=Blue Guardian.svg', category: 'prop-trading' },
  { id: 'alphacapital', name: 'Alpha Capital', filename: 'Firms=Alpha Capital.svg', category: 'prop-trading' },
  { id: 'aquafunded', name: 'AquaFunded', filename: 'Firms=AquaFunded.svg', category: 'prop-trading' },
  { id: 'audacity', name: 'Audacity', filename: 'Firms=Audacity.svg', category: 'prop-trading' },
  { id: 'atfunded', name: 'AT Funded', filename: 'Firms=AT Funded.svg', category: 'prop-trading' },
  { id: 'qtfunded', name: 'QT Funded', filename: 'Firms= QT Funded.svg', category: 'prop-trading' },
  { id: 'blueberry', name: 'Blueberry', filename: 'Firms=Blueberry.svg', category: 'prop-trading' },
  { id: 'breakoutprop', name: 'Breakout Prop', filename: 'Firms=Breakout Prop.svg', category: 'prop-trading' },
  { id: 'brightfunded', name: 'Bright Funded', filename: 'Firms=Bright Funded.svg', category: 'prop-trading' },
  { id: 'cft', name: 'CFT', filename: 'Firms=CFT.svg', category: 'prop-trading' },
  { id: 'citytraders', name: 'City Traders Imperium', filename: 'Firms=City Traders Imperium.svg', category: 'prop-trading' },
  { id: 'darwinexzero', name: 'Darwinex Zero', filename: 'Firms=Darwinex Zero.svg', category: 'prop-trading' },
  { id: 'e8markets', name: 'E8 Markets', filename: 'Firms=E8 Markets.svg', category: 'prop-trading' },
  { id: 'elitetrader', name: 'Elite Trader Funding', filename: 'Firms=Elite Trader Funding.svg', category: 'prop-trading' },
  { id: 'finotive', name: 'Finotive Funding', filename: 'Firms=Finotive Funding.svg', category: 'prop-trading' },
  { id: 'fintokei', name: 'Fintokei', filename: 'Firms=Fintokei.svg', category: 'prop-trading' },
  { id: 'fortraders', name: 'For Traders', filename: 'Firms=For Traders.svg', category: 'prop-trading' },
  { id: 'fundedtradercapital', name: 'Funded Trader Capital', filename: 'Firms=Funded Trader Capital.svg', category: 'prop-trading' },
  { id: 'fundedtradingplus', name: 'Funded Trading Plus', filename: 'Firms=Funded Trading Plus.svg', category: 'prop-trading' },
  { id: 'fundednext', name: 'FundedNext', filename: 'Firms=FundedNext.svg', category: 'prop-trading' },
  { id: 'fundingtrader', name: 'Funding Trader', filename: 'Firms=Funding Trader.svg', category: 'prop-trading' },
  { id: 'goatfunded', name: 'Goat Funded Trader', filename: 'Firms=Goat Funded Trader.svg', category: 'prop-trading' },
  { id: 'hantectrader', name: 'Hantec Trader', filename: 'Firms=Hantec Trader.svg', category: 'prop-trading' },
  { id: 'lark', name: 'Lark', filename: 'Firms=Lark.svg', category: 'prop-trading' },
  { id: 'maven', name: 'Maven', filename: 'Firms=Maven.svg', category: 'prop-trading' },
  { id: 'mentfunding', name: 'Ment Funding', filename: 'Firms=Ment Funding.svg', category: 'prop-trading' },
  { id: 'nordicfunder', name: 'Nordic Funder', filename: 'Firms=Nordic Funder.svg', category: 'prop-trading' },
  { id: 'oandaprop', name: 'OANDA Prop Trader', filename: 'Firms=OANDA Prop Trader.svg', category: 'prop-trading' },
  { id: 'pipfarm', name: 'PipFarm', filename: 'Firms=PipFarm.svg', category: 'prop-trading' },
  { id: 'seacrestfunded', name: 'Seacrest Funded', filename: 'Firms=Seacrest Funded.svg', category: 'prop-trading' },
  { id: 'thinkcapital', name: 'ThinkCapital', filename: 'Firms=ThinkCapital.svg', category: 'prop-trading' },
  { id: 'toponetrader', name: 'Top One Trader', filename: 'Firms=Top One Trader.svg', category: 'prop-trading' },
  { id: 'traddoo', name: 'Traddoo', filename: 'Firms=Traddoo.svg', category: 'prop-trading' },
  { id: 'tradethepool', name: 'Trade The Pool', filename: 'Firms=Trade The Pool.svg', category: 'prop-trading' },
]

export const getLogoById = (id: string): LogoData | undefined => {
  return logoLibrary.find(logo => logo.id === id)
}

export const getLogosByCategory = (category: string): LogoData[] => {
  return logoLibrary.filter(logo => logo.category === category)
}

export const searchLogos = (query: string): LogoData[] => {
  const lowercaseQuery = query.toLowerCase()
  return logoLibrary.filter(logo => 
    logo.name.toLowerCase().includes(lowercaseQuery) ||
    logo.id.toLowerCase().includes(lowercaseQuery)
  )
}