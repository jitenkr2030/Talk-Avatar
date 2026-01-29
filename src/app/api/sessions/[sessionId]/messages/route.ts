import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { content, messageType = 'user', emotion, confidence } = body

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Verify session exists and is active
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { avatar: true }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Create user message
    const userMessage = await db.message.create({
      data: {
        sessionId,
        content,
        messageType,
        emotion,
        confidence
      }
    })

    // Update session message count
    await db.session.update({
      where: { id: sessionId },
      data: { 
        messageCount: { increment: 1 },
        updatedAt: new Date()
      }
    })

    // If this is a user message, generate AI response
    if (messageType === 'user') {
      try {
        // Use LLM skill to generate response
        const { LLM } = await import('@/skills/LLM/scripts/chat')
        
        const systemPrompt = `You are ${session.avatar.name}, ${session.avatar.description}. 
        Personality: ${session.avatar.personality || 'friendly and helpful'}
        Role: ${session.avatar.role || 'assistant'}
        Language: ${session.language}
        
        Respond in character and keep responses concise but engaging.`

        const llmResponse = await LLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content }
          ],
          temperature: 0.7,
          max_tokens: 150
        })

        // Create AI response message
        const aiMessage = await db.message.create({
          data: {
            sessionId,
            content: llmResponse.content,
            messageType: 'assistant',
            confidence: 0.9
          }
        })

        // Update session message count again
        await db.session.update({
          where: { id: sessionId },
          data: { 
            messageCount: { increment: 1 },
            updatedAt: new Date()
          }
        })

        return NextResponse.json({
          userMessage,
          aiMessage
        })

      } catch (llmError) {
        console.error('LLM Error:', llmError)
        
        // Fallback response
        const fallbackMessage = await db.message.create({
          data: {
            sessionId,
            content: `I'm ${session.avatar.name}. How can I assist you today?`,
            messageType: 'assistant',
            confidence: 0.5
          }
        })

        return NextResponse.json({
          userMessage,
          aiMessage: fallbackMessage
        })
      }
    }

    return NextResponse.json({ message: userMessage })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messages = await db.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}