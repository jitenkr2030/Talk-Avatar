import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 })
    }

    // In a real implementation, this would connect to the likeness service
    // For now, return mock progress
    const mockProgress = {
      jobId,
      progress: Math.floor(Math.random() * 100),
      status: 'processing',
      message: 'Generating 1:1 likeness avatar...'
    }

    return NextResponse.json(mockProgress)

  } catch (error) {
    console.error('Progress check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check progress' 
    }, { status: 500 })
  }
}