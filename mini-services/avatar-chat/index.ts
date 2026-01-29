import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { ASR } from '../../../skills/ASR/scripts/asr'
import { TTS } from '../../../skills/TTS/tts'
import { LLM } from '../../../skills/LLM/scripts/chat'

const server = createServer()
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const PORT = 3001

// Store active sessions
const activeSessions = new Map()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('start_session', async (data) => {
    try {
      const { avatarId, userId, message } = data
      
      // Create session ID
      const sessionId = `${userId}-${avatarId}-${Date.now()}`
      
      // Store session info
      activeSessions.set(sessionId, {
        socketId: socket.id,
        avatarId,
        userId,
        startTime: new Date(),
        messageCount: 0
      })

      // Join session room
      socket.join(sessionId)

      // Send session started event
      socket.emit('session_started', { sessionId })

      // If initial message provided, process it
      if (message) {
        await processMessage(socket, sessionId, message, 'user')
      }

    } catch (error) {
      console.error('Error starting session:', error)
      socket.emit('error', { message: 'Failed to start session' })
    }
  })

  socket.on('message', async (data) => {
    try {
      const { sessionId, content, type = 'text' } = data
      
      if (!activeSessions.has(sessionId)) {
        socket.emit('error', { message: 'Session not found' })
        return
      }

      if (type === 'text') {
        await processMessage(socket, sessionId, content, 'user')
      } else if (type === 'audio') {
        // Process audio with ASR
        try {
          const transcription = await ASR({
            audio: content,
            language: 'en'
          })
          
          socket.emit('transcription', { 
            sessionId, 
            text: transcription.text,
            confidence: transcription.confidence
          })

          await processMessage(socket, sessionId, transcription.text, 'user')
        } catch (asrError) {
          console.error('ASR Error:', asrError)
          socket.emit('error', { message: 'Speech recognition failed' })
        }
      }

    } catch (error) {
      console.error('Error processing message:', error)
      socket.emit('error', { message: 'Failed to process message' })
    }
  })

  socket.on('audio_stream', async (data) => {
    try {
      const { sessionId, audioData } = data
      
      if (!activeSessions.has(sessionId)) {
        return
      }

      // Process streaming audio with ASR
      // This would use streaming ASR in a real implementation
      socket.emit('audio_processed', { sessionId })

    } catch (error) {
      console.error('Error processing audio stream:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    
    // Clean up sessions for this socket
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.socketId === socket.id) {
        activeSessions.delete(sessionId)
        io.to(sessionId).emit('session_ended', { sessionId })
      }
    }
  })
})

async function processMessage(socket, sessionId, content, messageType) {
  try {
    const session = activeSessions.get(sessionId)
    if (!session) return

    // Update message count
    session.messageCount++

    // Emit user message
    socket.emit('message', {
      sessionId,
      content,
      messageType,
      timestamp: new Date().toISOString()
    })

    // Generate AI response
    const systemPrompt = `You are a helpful AI assistant. Respond naturally and engagingly.`
    
    const llmResponse = await LLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
      ],
      temperature: 0.7,
      max_tokens: 150
    })

    // Generate speech for AI response
    try {
      const ttsResponse = await TTS({
        text: llmResponse.content,
        voice_id: 'default',
        language: 'en'
      })

      // Emit AI response with audio
      socket.emit('message', {
        sessionId,
        content: llmResponse.content,
        messageType: 'assistant',
        audioUrl: ttsResponse.audio_url,
        timestamp: new Date().toISOString()
      })

      // Stream audio if available
      if (ttsResponse.audio_data) {
        socket.emit('audio_stream', {
          sessionId,
          audioData: ttsResponse.audio_data,
          format: 'wav'
        })
      }

    } catch (ttsError) {
      console.error('TTS Error:', ttsError)
      
      // Fallback to text-only response
      socket.emit('message', {
        sessionId,
        content: llmResponse.content,
        messageType: 'assistant',
        timestamp: new Date().toISOString()
      })
    }

    // Emit emotion detection (simulated)
    const emotions = detectEmotion(llmResponse.content)
    socket.emit('emotion', {
      sessionId,
      emotions,
      confidence: 0.8
    })

  } catch (error) {
    console.error('Error in processMessage:', error)
    socket.emit('error', { message: 'Failed to generate response' })
  }
}

function detectEmotion(text) {
  // Simple emotion detection based on keywords
  const emotions = {
    happy: ['happy', 'glad', 'excited', 'wonderful', 'great'],
    sad: ['sad', 'sorry', 'unfortunately', 'disappointed'],
    angry: ['angry', 'frustrated', 'annoyed'],
    surprised: ['wow', 'amazing', 'surprising', 'incredible'],
    neutral: []
  }

  const lowerText = text.toLowerCase()
  const detectedEmotions = []

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      detectedEmotions.push(emotion)
    }
  }

  return detectedEmotions.length > 0 ? detectedEmotions : ['neutral']
}

server.listen(PORT, () => {
  console.log(`Avatar chat service running on port ${PORT}`)
})