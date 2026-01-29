import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { TTS } from '../../../skills/TTS/tts'
import { imageGeneration } from '../../../skills/image-generation/scripts/image-generation'
import { videoGeneration } from '../../../skills/video-generation/scripts/video'

const server = createServer()
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const PORT = 3002

// Active video generation jobs
const activeJobs = new Map()

io.on('connection', (socket) => {
  console.log('Client connected to video service:', socket.id)

  socket.on('generate_video', async (data) => {
    try {
      const { jobId, script, avatarConfig, videoConfig } = data
      
      // Create job record
      activeJobs.set(jobId, {
        socketId: socket.id,
        status: 'processing',
        progress: 0,
        startTime: new Date()
      })

      // Join job room
      socket.join(jobId)

      // Start generation process
      await generateVideo(socket, jobId, script, avatarConfig, videoConfig)

    } catch (error) {
      console.error('Error starting video generation:', error)
      socket.emit('video_error', { jobId, error: error.message })
    }
  })

  socket.on('get_job_status', (data) => {
    const { jobId } = data
    const job = activeJobs.get(jobId)
    
    if (job) {
      socket.emit('job_status', { jobId, ...job })
    } else {
      socket.emit('job_not_found', { jobId })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected from video service:', socket.id)
  })
})

async function generateVideo(socket, jobId, script, avatarConfig, videoConfig) {
  try {
    const job = activeJobs.get(jobId)
    
    // Step 1: Generate speech
    updateJobProgress(jobId, 10, 'Generating speech...')
    
    const speechResult = await TTS({
      text: script,
      voice_id: avatarConfig.voiceId || 'default',
      language: videoConfig.language || 'en',
      speed: videoConfig.speechSpeed || 1.0
    })

    updateJobProgress(jobId, 30, 'Speech generated. Creating avatar frames...')

    // Step 2: Generate avatar frames for lip sync
    const frames = await generateAvatarFrames(script, avatarConfig, speechResult)
    
    updateJobProgress(jobId, 70, 'Frames generated. Assembling video...')

    // Step 3: Assemble video
    const videoResult = await assembleVideo(frames, speechResult, videoConfig)
    
    updateJobProgress(jobId, 90, 'Video assembled. Finalizing...')

    // Step 4: Finalize and return
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate final processing

    updateJobProgress(jobId, 100, 'Video generation complete!')

    // Update job as complete
    const jobData = activeJobs.get(jobId)
    jobData.status = 'completed'
    jobData.videoUrl = videoResult.videoUrl
    jobData.thumbnailUrl = videoResult.thumbnailUrl
    jobData.duration = videoResult.duration

    socket.emit('video_completed', {
      jobId,
      videoUrl: videoResult.videoUrl,
      thumbnailUrl: videoResult.thumbnailUrl,
      duration: videoResult.duration
    })

  } catch (error) {
    console.error('Video generation error:', error)
    
    const jobData = activeJobs.get(jobId)
    if (jobData) {
      jobData.status = 'failed'
      jobData.error = error.message
    }

    socket.emit('video_error', { jobId, error: error.message })
  }
}

async function generateAvatarFrames(script, avatarConfig, speechResult) {
  const frames = []
  const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Generate different expressions based on content
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (!sentence) continue

    // Determine emotion/expression based on content
    const expression = detectExpression(sentence)
    
    // Generate avatar image with appropriate expression
    const prompt = createAvatarPrompt(avatarConfig, expression, sentence)
    
    try {
      const imageResult = await imageGeneration({
        prompt,
        size: '1024x1024',
        quality: 'high',
        style: 'realistic'
      })

      frames.push({
        imageUrl: imageResult.image_url,
        imageData: imageResult.image_data,
        expression,
        duration: estimateSentenceDuration(sentence)
      })

    } catch (error) {
      console.error('Error generating frame:', error)
      // Use a default frame if generation fails
      frames.push({
        imageUrl: '/api/placeholder/1024/1024',
        expression: 'neutral',
        duration: estimateSentenceDuration(sentence)
      })
    }
  }

  return frames
}

async function assembleVideo(frames, speechResult, videoConfig) {
  // In a real implementation, this would use FFmpeg or similar
  // For now, simulate video assembly
  
  const totalDuration = frames.reduce((sum, frame) => sum + frame.duration, 0)
  
  return {
    videoUrl: `/api/videos/generated/${Date.now()}.mp4`,
    thumbnailUrl: `/api/videos/generated/${Date.now()}_thumb.jpg`,
    duration: totalDuration,
    resolution: videoConfig.resolution || '1080p',
    frameCount: frames.length
  }
}

function detectExpression(sentence) {
  const lowerSentence = sentence.toLowerCase()
  
  if (lowerSentence.includes('happy') || lowerSentence.includes('excited') || lowerSentence.includes('great')) {
    return 'happy'
  } else if (lowerSentence.includes('sad') || lowerSentence.includes('sorry')) {
    return 'sad'
  } else if (lowerSentence.includes('question') || lowerSentence.includes('?')) {
    return 'curious'
  } else if (lowerSentence.includes('important') || lowerSentence.includes('serious')) {
    return 'serious'
  } else {
    return 'neutral'
  }
}

function createAvatarPrompt(avatarConfig, expression, sentence) {
  const basePrompt = `Professional portrait of ${avatarConfig.name || 'a person'}`
  const expressionDesc = {
    happy: 'smiling warmly, joyful expression',
    sad: 'concerned expression, empathetic look',
    curious: 'inquiring expression, slightly raised eyebrows',
    serious: 'professional, focused expression',
    neutral: 'calm, neutral expression'
  }

  return `${basePrompt}, ${expressionDesc[expression]}, speaking, mouth slightly open as if talking, high quality, professional lighting, clean background`
}

function estimateSentenceDuration(sentence) {
  // Rough estimate: 150ms per character + 500ms base
  return Math.max(2000, sentence.length * 150)
}

function updateJobProgress(jobId, progress, message) {
  const job = activeJobs.get(jobId)
  if (job) {
    job.progress = progress
    job.statusMessage = message
    
    // Notify client
    io.to(jobId).emit('progress_update', {
      jobId,
      progress,
      message
    })
  }
}

server.listen(PORT, () => {
  console.log(`Video generator service running on port ${PORT}`)
})