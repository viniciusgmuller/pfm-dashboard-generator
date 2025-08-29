import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    const filePath = path.join(
      process.cwd(),
      'public',
      'generated-dashboards',
      filename
    )

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath)
    
    // Determine content type based on file extension
    let contentType = 'image/png'
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg'
    } else if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf'
    }

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to serve dashboard' },
      { status: 500 }
    )
  }
}