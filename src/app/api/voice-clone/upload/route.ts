import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const audio = formData.get('audio') as File

    if (!userId || !audio) {
      return NextResponse.json({ 
        error: 'User ID and audio file are required' 
      }, { status: 400 })
    }

    // Convert audio to buffer
    const audioBuffer = Buffer.from(await audio.arrayBuffer())

    // Send to voice cloning service
    const voiceFormData = new FormData()
    voiceFormData.append('userId', userId)
    voiceFormData.append('audio', new Blob([audioBuffer]), audio.name)

    const response = await fetch('http://localhost:3004/upload-voice', {
      method: 'POST',
      body: voiceFormData
    })

    if (!response.ok) {
      throw new Error('Failed to upload audio for voice cloning')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Voice clone upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to process voice clone upload' 
    }, { status: 500 })
  }
}