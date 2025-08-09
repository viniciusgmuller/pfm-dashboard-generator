import puppeteer from 'puppeteer'
import { parseCSV, getContextualRanking } from './csv-parser'
import fs from 'fs'
import path from 'path'

async function quickScreenshot() {
  try {
    const csvPath = path.join(__dirname, '../data/weekly/data.csv')
    const firms = parseCSV(csvPath)
    
    const ftmo = firms.find(f => f.firmName === 'FTMO')!
    
    console.log(`Expected FTMO values:`)
    console.log(`- Favorites: ${ftmo.visitsPinkCurrent} (Column H)`)
    console.log(`- Visits: ${ftmo.cfdShare}% (Column N)`)
    
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setViewport({ width: 1560, height: 850 })
    
    const competitors = getContextualRanking(firms, ftmo, 3, 1)
    const firmDataParam = encodeURIComponent(JSON.stringify(ftmo))
    const competitorsParam = encodeURIComponent(JSON.stringify(competitors))
    
    const url = `http://localhost:3002/dashboard/${ftmo.firmName.toLowerCase()}?data=${firmDataParam}&competitors=${competitorsParam}`
    
    console.log('📸 Taking screenshot...')
    await page.goto(url, { waitUntil: 'networkidle2' })
    await page.waitForSelector('[data-ready="true"]', { timeout: 15000 })
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const outputDir = './output/data-test'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(outputDir, 'FTMO_corrected_data.png') })
    
    console.log('✅ Screenshot saved: output/data-test/FTMO_corrected_data.png')
    
    await browser.close()
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

quickScreenshot()