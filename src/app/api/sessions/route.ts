import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { avatarId, userId, language = 'en' } = body

    if (!avatarId || !userId) {
      return NextResponse.json({ error: 'Avatar ID and User ID are required' }, { status: 400 })
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

    const session = await db.session.create({
      data: {
        sessionId: uuidv4(),
        avatarId,
        userId,
        language,
        status: 'active'
      }
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
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

    const sessions = await db.session.findMany({
      where: { userId },
      include: {
        avatar: {
          select: { name: true, imageUrl: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}