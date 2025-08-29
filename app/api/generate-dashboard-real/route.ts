import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageBlob = formData.get('image') as Blob
    const firmName = formData.get('firmName') as string
    const index = formData.get('index') as string
    const total = formData.get('total') as string
    
    if (!imageBlob || !firmName) {
      return NextResponse.json(
        { success: false, error: 'Image and firm name are required' },
        { status: 400 }
      )
    }
    
    // Convert blob to buffer
    const buffer = Buffer.from(await imageBlob.arrayBuffer())
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'generated-dashboards')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Save image
    const filename = `${firmName.replace(/\s+/g, '_')}.png`
    const filePath = path.join(outputDir, filename)
    fs.writeFileSync(filePath, buffer)
    
    console.log(`Saved dashboard ${parseInt(index) + 1}/${total}: ${filename}`)
    
    return NextResponse.json({
      success: true,
      dashboard: {
        firmName,
        filename,
        url: `/generated-dashboards/${filename}`,
        generatedAt: new Date(),
        size: buffer.length
      }
    })
  } catch (error) {
    console.error('Error saving dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save dashboard' },
      { status: 500 }
    )
  }
}