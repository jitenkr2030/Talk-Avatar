import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, userId, permissions = 'read' } = body

    if (!name || !userId) {
      return NextResponse.json({ error: 'Name and User ID are required' }, { status: 400 })
    }

    // Generate API key
    const key = `tk_${uuidv4().replace(/-/g, '')}`

    const apiKey = await db.apiKey.create({
      data: {
        name,
        key,
        userId,
        permissions,
        rateLimit: 1000
      }
    })

    return NextResponse.json({ apiKey }, { status: 201 })
  } catch (error) {
    console.error('Error creating API key:', error)
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

    const apiKeys = await db.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}