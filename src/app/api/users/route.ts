import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, avatar } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email,
        name,
        avatar,
        plan: 'free',
        credits: 10 // Give new users 10 free credits
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')

    if (email) {
      const user = await db.user.findUnique({
        where: { email },
        include: {
          avatars: {
            select: { id: true, name: true, trainingStatus: true, isActive: true }
          },
          sessions: {
            select: { id: true, status: true, startTime: true, messageCount: true },
            orderBy: { startTime: 'desc' },
            take: 10
          },
          videos: {
            select: { id: true, title: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ user })
    } else if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          avatars: true,
          sessions: true,
          videos: true,
          apiKeys: true
        }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({ user })
    } else {
      return NextResponse.json({ error: 'Email or User ID is required' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}