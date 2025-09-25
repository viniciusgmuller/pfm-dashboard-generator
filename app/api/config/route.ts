import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    FLY_WORKER_URL: process.env.NEXT_PUBLIC_FLY_WORKER_URL || 'NOT_SET',
    FLY_WORKER_URL_NON_PUBLIC: process.env.FLY_WORKER_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV: Object.keys(process.env).filter(key => key.includes('FLY'))
  })
}