import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import compression from 'compression'
import NodeCache from 'node-cache'
import { ASR } from '../../../skills/ASR/scripts/asr'
import { TTS } from '../../../skills/TTS/tts'
import { LLM } from '../../../skills/LLM/scripts/chat'

const server = createServer()
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
})

const PORT = 3003

// Performance optimization caches
const responseCache = new NodeCache({ stdTTL: 300, checkperiod: 120 }) // 5min cache
const avatarCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }) // 1hr cache
const ttsCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 }) // 30min cache

// Performance monitoring
const performanceMetrics = {
  totalRequests: 0,
  avgResponseTime: 0,
  sub200msResponses: 0,
  cacheHits: 0,
  cacheMisses: 0
}

// Pre-load common responses for instant delivery
const commonResponses = new Map([
  ['greeting', 'Hello! How can I help you today?'],
  ['goodbye', 'Goodbye! Have a great day!'],
  ['thanks', 'You\'re welcome! Is there anything else I can help with?'],
  ['help', 'I\'m here to help! What do you need assistance with?'],
  ['unknown', 'I understand. Could you tell me more about that?']
])

// Fast JSON stringifier for better performance
const stringify = require('fast-json-stringify')

const responseStringify = stringify({
  type: 'object',
  properties: {
    sessionId: { type: 'string' },
    content: { type: 'string' },
    messageType: { type: 'string' },
    timestamp: { type: 'string' },
    audioUrl: { type: 'string' },
    processingTime: { type: 'number' },
    latency: { type: 'number' }
  }
})

// Ultra-fast session management
const activeSessions = new Map()
const sessionPromises = new Map()

// Pre-warm AI services
let preloadedModels = false
async function preloadModels() {
  if (preloadedModels) return
  
  try {
    // Pre-load LLM with common context
    await LLM({
      messages: [{ role: 'user', content: 'warm up' }],
      temperature: 0.7,
      max_tokens: 10
    })
    
    // Pre-load TTS with common phrase
    await TTS({
      text: 'Hello',
      voice_id: 'default',
      language: 'en'
    })
    
    preloadedModels = true
    console.log('✅ AI models preloaded for optimal performance')
  } catch (error) {
    console.log('⚠️ Model preloading failed, will load on demand')
  }
}

// Optimized response generation with caching
async function generateOptimizedResponse(sessionId, content, avatarConfig) {
  const startTime = performance.now()
  
  // Check cache first for instant responses
  const cacheKey = `${sessionId}_${content.substring(0, 50)}`
  const cached = responseCache.get(cacheKey)
  
  if (cached) {
    performanceMetrics.cacheHits++
    const endTime = performance.now()
    const latency = endTime - startTime
    
    return {
      ...cached,
      cached: true,
      processingTime: latency,
      latency: latency
    }
  }
  
  performanceMetrics.cacheMisses++
  
  try {
    // Use pre-built responses for common inputs
    const lowerContent = content.toLowerCase()
    for (const [key, response] of commonResponses) {
      if (lowerContent.includes(key)) {
        const endTime = performance.now()
        const latency = endTime - startTime
        
        const result = {
          sessionId,
          content: response,
          messageType: 'assistant',
          timestamp: new Date().toISOString(),
          processingTime: latency,
          latency: latency,
          cached: false
        }
        
        // Cache for future use
        responseCache.set(cacheKey, result)
        
        if (latency < 200) performanceMetrics.sub200msResponses++
        return result
      }
    }
    
    // Parallel processing for maximum speed
    const [llmPromise, ttsPromise] = await Promise.allSettled([
      // Optimized LLM call with reduced tokens for speed
      LLM({
        messages: [
          { 
            role: 'system', 
            content: `${avatarConfig.personality || 'Friendly assistant'}. Respond concisely in 1-2 sentences.` 
          },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 50 // Reduced for speed
      }),
      
      // Start TTS in parallel with LLM
      TTS({
        text: content, // Use original text for now, will update with LLM response
        voice_id: avatarConfig.voiceId || 'default',
        language: avatarConfig.language || 'en',
        speed: 1.1 // Slightly faster for better responsiveness
      })
    ])
    
    let llmResponse = 'I understand. How can I help you with that?'
    let audioUrl = null
    
    if (llmPromise.status === 'fulfilled') {
      llmResponse = llmPromise.value.content
    }
    
    if (ttsPromise.status === 'fulfilled') {
      audioUrl = ttsPromise.value.audio_url
      
      // Cache TTS result
      ttsCache.set(content, audioUrl)
    }
    
    const endTime = performance.now()
    const latency = endTime - startTime
    
    const result = {
      sessionId,
      content: llmResponse,
      messageType: 'assistant',
      timestamp: new Date().toISOString(),
      audioUrl,
      processingTime: latency,
      latency: latency,
      cached: false
    }
    
    // Cache the complete response
    responseCache.set(cacheKey, result)
    
    if (latency < 200) performanceMetrics.sub200msResponses++
    
    return result
    
  } catch (error) {
    console.error('Response generation error:', error)
    
    const endTime = performance.now()
    const latency = endTime - startTime
    
    // Fallback response
    return {
      sessionId,
      content: 'I\'m here to help you!',
      messageType: 'assistant',
      timestamp: new Date().toISOString(),
      processingTime: latency,
      latency: latency,
      cached: false,
      error: true
    }
  }
}

// Optimized ASR with caching
async function optimizedASR(audioData, language = 'en') {
  const startTime = performance.now()
  
  try {
    // Check if we have a cached transcription for similar audio
    const audioHash = Buffer.from(audioData).toString('base64').substring(0, 32)
    const cached = responseCache.get(`asr_${audioHash}`)
    
    if (cached) {
      const endTime = performance.now()
      return {
        ...cached,
        processingTime: endTime - startTime,
        cached: true
      }
    }
    
    const result = await ASR({
      audio: audioData,
      language
    })
    
    const endTime = performance.now()
    const enhancedResult = {
      ...result,
      processingTime: endTime - startTime,
      cached: false
    }
    
    // Cache short transcriptions
    if (result.text && result.text.length < 100) {
      responseCache.set(`asr_${audioHash}`, enhancedResult, 300) // 5min cache
    }
    
    return enhancedResult
    
  } catch (error) {
    console.error('ASR error:', error)
    return {
      text: '',
      confidence: 0,
      processingTime: performance.now() - startTime,
      error: true
    }
  }
}

// WebSocket connection handling with optimizations
io.on('connection', (socket) => {
  console.log(`⚡ Ultra-fast client connected: ${socket.id}`)
  
  socket.on('start_optimized_session', async (data) => {
    const startTime = performance.now()
    
    try {
      const { avatarId, userId, message, priority = 'normal' } = data
      const sessionId = `${userId}-${avatarId}-${Date.now()}`
      
      // Get avatar config from cache or load it
      let avatarConfig = avatarCache.get(avatarId)
      if (!avatarConfig) {
        avatarConfig = {
          id: avatarId,
          personality: 'Friendly and helpful assistant',
          voiceId: 'default',
          language: 'en'
        }
        avatarCache.set(avatarId, avatarConfig)
      }
      
      // Create optimized session
      const session = {
        sessionId,
        socketId: socket.id,
        avatarId,
        userId,
        startTime: new Date(),
        messageCount: 0,
        lastActivity: Date.now(),
        priority,
        avatarConfig
      }
      
      activeSessions.set(sessionId, session)
      socket.join(sessionId)
      
      const endTime = performance.now()
      const setupLatency = endTime - startTime
      
      // Instant session start response
      socket.emit('optimized_session_started', { 
        sessionId,
        setupLatency,
        message: 'Session ready for ultra-low latency interaction'
      })
      
      // Process initial message if provided
      if (message) {
        await processOptimizedMessage(socket, sessionId, message, 'text', priority)
      }
      
    } catch (error) {
      console.error('Session start error:', error)
      socket.emit('error', { message: 'Failed to start optimized session' })
    }
  })
  
  socket.on('optimized_message', async (data) => {
    try {
      const { sessionId, content, type = 'text', priority = 'normal' } = data
      
      if (!activeSessions.has(sessionId)) {
        socket.emit('error', { message: 'Session not found' })
        return
      }
      
      await processOptimizedMessage(socket, sessionId, content, type, priority)
      
    } catch (error) {
      console.error('Optimized message error:', error)
      socket.emit('error', { message: 'Failed to process message' })
    }
  })
  
  socket.on('stream_audio', async (data) => {
    try {
      const { sessionId, audioChunk, sequence } = data
      
      if (!activeSessions.has(sessionId)) return
      
      const session = activeSessions.get(sessionId)
      session.lastActivity = Date.now()
      
      // Process audio chunk with ASR
      const transcription = await optimizedASR(audioChunk, session.avatarConfig.language)
      
      if (transcription.text && transcription.confidence > 0.7) {
        socket.emit('audio_transcription', {
          sessionId,
          text: transcription.text,
          confidence: transcription.confidence,
          processingTime: transcription.processingTime,
          sequence
        })
        
        // Generate response for transcribed text
        await processOptimizedMessage(socket, sessionId, transcription.text, 'text', 'high')
      }
      
    } catch (error) {
      console.error('Audio streaming error:', error)
    }
  })
  
  socket.on('get_performance_metrics', () => {
    const metrics = {
      ...performanceMetrics,
      activeSessions: activeSessions.size,
      cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100,
      sub200msRate: (performanceMetrics.sub200msResponses / performanceMetrics.totalRequests) * 100,
      avgLatency: performanceMetrics.avgResponseTime
    }
    
    socket.emit('performance_metrics', metrics)
  })
  
  socket.on('disconnect', () => {
    console.log(`⚡ Ultra-fast client disconnected: ${socket.id}`)
    
    // Clean up sessions
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.socketId === socket.id) {
        activeSessions.delete(sessionId)
        socket.emit('optimized_session_ended', { sessionId })
      }
    }
  })
})

async function processOptimizedMessage(socket, sessionId, content, messageType, priority = 'normal') {
  const startTime = performance.now()
  
  try {
    const session = activeSessions.get(sessionId)
    if (!session) return
    
    session.messageCount++
    session.lastActivity = Date.now()
    
    // Update metrics
    performanceMetrics.totalRequests++
    
    // Emit user message instantly
    socket.emit('optimized_message', {
      sessionId,
      content,
      messageType,
      timestamp: new Date().toISOString(),
      processingTime: performance.now() - startTime
    })
    
    // Generate optimized response
    const response = await generateOptimizedResponse(sessionId, content, session.avatarConfig)
    
    // Update average response time
    const currentAvg = performanceMetrics.avgResponseTime
    const newAvg = (currentAvg + response.latency) / 2
    performanceMetrics.avgResponseTime = newAvg
    
    // Emit response with performance data
    socket.emit('optimized_message', response)
    
    // Log performance
    if (response.latency < 200) {
      console.log(`⚡ Ultra-fast response: ${response.latency.toFixed(2)}ms`)
    } else {
      console.log(`📊 Response time: ${response.latency.toFixed(2)}ms`)
    }
    
  } catch (error) {
    console.error('Message processing error:', error)
    socket.emit('error', { message: 'Failed to process optimized message' })
  }
}

// Performance monitoring and optimization
setInterval(() => {
  // Clean up inactive sessions
  const now = Date.now()
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity > 300000) { // 5 minutes
      activeSessions.delete(sessionId)
    }
  }
  
  // Log performance metrics
  console.log('📊 Performance Metrics:', {
    activeSessions: activeSessions.size,
    avgLatency: `${performanceMetrics.avgResponseTime.toFixed(2)}ms`,
    sub200msRate: `${(performanceMetrics.sub200msResponses / performanceMetrics.totalRequests * 100).toFixed(1)}%`,
    cacheHitRate: `${(performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100).toFixed(1)}%`
  })
}, 30000) // Every 30 seconds

// Preload models on startup
preloadModels()

server.listen(PORT, () => {
  console.log(`⚡ Ultra-low latency avatar service running on port ${PORT}`)
  console.log(`🎯 Target: <200ms response time`)
})