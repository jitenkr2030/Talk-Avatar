import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      script, 
      avatarId, 
      userId, 
      resolution = '1080p',
      backgroundType = 'solid',
      backgroundColor = '#ffffff',
      language = 'en',
      voiceSettings
    } = body

    if (!title || !script || !avatarId || !userId) {
      return NextResponse.json({ 
        error: 'Title, script, avatar ID, and user ID are required' 
      }, { status: 400 })
    }

    // Verify avatar exists and belongs to user
    const avatar = await db.avatar.findFirst({
      where: { 
        id: avatarId, 
        userId,
        isActive: true,
        trainingStatus: 'ready'
      }
    })

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found or not ready' }, { status: 404 })
    }

    // Create video record
    const video = await db.video.create({
      data: {
        title,
        script,
        avatarId,
        userId,
        resolution,
        backgroundType,
        backgroundColor,
        language,
        voiceSettings: voiceSettings ? JSON.stringify(voiceSettings) : null,
        status: 'processing'
      }
    })

    // Start video generation in background
    generateVideoAsync(video.id, script, avatar, voiceSettings)

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const videos = await db.video.findMany({
      where: { userId },
      include: {
        avatar: {
          select: { name: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateVideoAsync(
  videoId: string, 
  script: string, 
  avatar: any, 
  voiceSettings?: any
) {
  try {
    // Update progress
    await updateVideoProgress(videoId, 10)

    // Generate speech using TTS
    const { TTS } = await import('@/skills/TTS/tts')
    const audioResult = await TTS({
      text: script,
      voice_id: avatar.voiceId || 'default',
      language: avatar.language || 'en',
      ...voiceSettings
    })

    await updateVideoProgress(videoId, 40)

    // Generate video frames using image generation for each scene
    const { imageGeneration } = await import('@/skills/image-generation/scripts/image-generation')
    
    // Split script into scenes (simplified - in production, use more sophisticated scene detection)
    const scenes = script.split('.').filter(s => s.trim().length > 0).slice(0, 5)
    const frames = []

    for (let i = 0; i < scenes.length; i++) {
      const prompt = `Portrait of ${avatar.name}, ${avatar.description}, speaking expressively, professional headshot, high quality`
      const frame = await imageGeneration({
        prompt,
        size: '1024x1024',
        quality: 'high'
      })
      frames.push(frame)
      await updateVideoProgress(videoId, 40 + (i * 10))
    }

    await updateVideoProgress(videoId, 90)

    // Simulate video assembly (in production, use actual video processing library)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update video as complete
    await db.video.update({
      where: { id: videoId },
      data: {
        status: 'ready',
        videoUrl: '/api/videos/' + videoId + '/stream',
        thumbnailUrl: '/api/videos/' + videoId + '/thumbnail',
        duration: Math.floor(script.length * 0.15), // Rough estimate: 150ms per character
        progress: 100
      }
    })

  } catch (error) {
    console.error('Video generation error:', error)
    
    // Mark video as failed
    await db.video.update({
      where: { id: videoId },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        progress: 0
      }
    })
  }
}

async function updateVideoProgress(videoId: string, progress: number) {
  await db.video.update({
    where: { id: videoId },
    data: { progress }
  })
}