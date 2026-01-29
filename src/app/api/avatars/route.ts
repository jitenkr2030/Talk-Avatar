import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const avatars = await db.avatar.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ avatars })
  } catch (error) {
    console.error('Error fetching avatars:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      imageUrl, 
      videoUrl, 
      voiceId, 
      language, 
      gender, 
      ageRange, 
      ethnicity, 
      personality, 
      role, 
      userId 
    } = body

    if (!name || !userId) {
      return NextResponse.json({ error: 'Name and User ID are required' }, { status: 400 })
    }

    const avatar = await db.avatar.create({
      data: {
        name,
        description,
        imageUrl,
        videoUrl,
        voiceId,
        language: language || 'en',
        gender,
        ageRange,
        ethnicity,
        personality,
        role,
        userId
      }
    })

    return NextResponse.json({ avatar }, { status: 201 })
  } catch (error) {
    console.error('Error creating avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}