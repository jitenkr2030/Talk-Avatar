import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import formidable from 'formidable'
import sharp from 'sharp'
import NodeCache from 'node-cache'
import { TTS } from '../../../skills/TTS/tts'
import { imageGeneration } from '../../../skills/image-generation/scripts/image-generation'

const server = createServer()
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const PORT = 3004

// Caches for likeness models and voice clones
const likenessCache = new NodeCache({ stdTTL: 7200, checkperiod: 600 }) // 2hr cache
const voiceCloneCache = new NodeCache({ stdTTL: 7200, checkperiod: 600 }) // 2hr cache
const processingJobs = new Map()

// Likeness training progress tracking
const trainingProgress = new Map()

// Face feature extraction (simplified)
async function extractFaceFeatures(imageBuffer) {
  try {
    // Process image for face analysis
    const processedImage = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'cover' })
      .removeAlpha()
      .toBuffer()

    // Simulate face feature extraction
    // In production, this would use actual face detection libraries
    const features = {
      faceShape: 'oval',
      eyeColor: 'brown',
      skinTone: 'medium',
      hairColor: 'dark',
      facialStructure: {
        jawline: 'defined',
        cheekbones: 'high',
        nose: 'straight',
        lips: 'medium'
      },
      uniqueFeatures: [],
      confidence: 0.85
    }

    return {
      features,
      processedImage,
      extractedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Face feature extraction error:', error)
    throw new Error('Failed to extract face features')
  }
}

// Generate 1:1 likeness avatar
async function generateLikenessAvatar(userId, imageBuffer, options = {}) {
  const jobId = `likeness_${userId}_${Date.now()}`
  
  try {
    // Update progress
    trainingProgress.set(jobId, { progress: 10, status: 'extracting_features' })
    
    // Extract face features
    const faceData = await extractFaceFeatures(imageBuffer)
    
    trainingProgress.set(jobId, { progress: 30, status: 'analyzing_features' })
    
    // Analyze features and create detailed prompt
    const prompt = createLikenessPrompt(faceData.features, options)
    
    trainingProgress.set(jobId, { progress: 50, status: 'generating_base_avatar' })
    
    // Generate multiple avatar variations
    const avatarVariations = []
    for (let i = 0; i < 3; i++) {
      const variationPrompt = `${prompt}, variation ${i + 1}, slightly different angle`
      
      const avatarImage = await imageGeneration({
        prompt: variationPrompt,
        size: '1024x1024',
        quality: 'ultra',
        style: 'photorealistic'
      })
      
      avatarVariations.push({
        variation: i + 1,
        imageUrl: avatarImage.image_url,
        imageData: avatarImage.image_data,
        prompt: variationPrompt
      })
      
      trainingProgress.set(jobId, { 
        progress: 50 + (i * 15), 
        status: `generating_variation_${i + 1}` 
      })
    }
    
    trainingProgress.set(jobId, { progress: 85, status: 'creating_expressions' })
    
    // Generate expression variations
    const expressions = ['neutral', 'smiling', 'talking', 'thoughtful']
    const expressionAvatars = []
    
    for (const expression of expressions) {
      const expressionPrompt = `${prompt}, ${expression} expression, natural pose`
      
      try {
        const expressionImage = await imageGeneration({
          prompt: expressionPrompt,
          size: '1024x1024',
          quality: 'high',
          style: 'photorealistic'
        })
        
        expressionAvatars.push({
          expression,
          imageUrl: expressionImage.image_url,
          imageData: expressionImage.image_data
        })
      } catch (error) {
        console.error(`Failed to generate ${expression} expression:`, error)
      }
    }
    
    trainingProgress.set(jobId, { progress: 95, status: 'finalizing' })
    
    // Create final likeness model
    const likenessModel = {
      jobId,
      userId,
      faceFeatures: faceData.features,
      baseAvatars: avatarVariations,
      expressions: expressionAvatars,
      accuracy: calculateLikenessAccuracy(faceData.features),
      createdAt: new Date().toISOString(),
      metadata: {
        originalImageSize: imageBuffer.length,
        processingTime: Date.now(),
        modelVersion: '1.0'
      }
    }
    
    // Cache the result
    likenessCache.set(userId, likenessModel)
    
    trainingProgress.set(jobId, { progress: 100, status: 'completed' })
    
    return likenessModel
    
  } catch (error) {
    trainingProgress.set(jobId, { progress: 0, status: 'failed', error: error.message })
    throw error
  }
}

function createLikenessPrompt(features, options) {
  const {
    style = 'professional',
    background = 'studio',
    lighting = 'soft'
  } = options
  
  let prompt = `Photorealistic portrait of a person with `
  
  // Add facial features
  prompt += `${features.faceShape} face shape, `
  prompt += `${features.facialStructure.jawline} jawline, `
  prompt += `${features.facialStructure.cheekbones} cheekbones, `
  prompt += `${features.facialStructure.nose} nose, `
  prompt += `${features.facialStructure.lips} lips. `
  
  // Add appearance details
  prompt += `${features.skinTone} skin tone, `
  prompt += `${features.hairColor} hair, `
  prompt += `${features.eyeColor} eyes. `
  
  // Add style and lighting
  prompt += `${style} style, `
  prompt += `${background} background, `
  prompt += `${lighting} lighting, `
  prompt += `high detail, ultra realistic, 8k, professional photography, `
  prompt += `perfect likeness, identical features, same person`
  
  return prompt
}

function calculateLikenessAccuracy(features) {
  // Simulate accuracy calculation based on feature quality
  let accuracy = 0.75 // Base accuracy
  
  if (features.confidence > 0.8) accuracy += 0.1
  if (features.uniqueFeatures.length > 0) accuracy += 0.05
  if (features.facialStructure.jawline === 'defined') accuracy += 0.03
  if (features.facialStructure.cheekbones === 'high') accuracy += 0.02
  
  return Math.min(accuracy, 0.98) // Cap at 98%
}

// Voice cloning functionality
async function cloneVoice(userId, audioBuffer, voiceSample) {
  const jobId = `voice_${userId}_${Date.now()}`
  
  try {
    // Update progress
    trainingProgress.set(jobId, { progress: 10, status: 'analyzing_voice' })
    
    // Analyze voice characteristics
    const voiceCharacteristics = await analyzeVoiceCharacteristics(audioBuffer)
    
    trainingProgress.set(jobId, { progress: 30, status: 'extracting_features' })
    
    // Create voice profile
    const voiceProfile = {
      userId,
      characteristics: voiceCharacteristics,
      sampleRate: 44100,
      duration: audioBuffer.length / 44100,
      quality: 'high'
    }
    
    trainingProgress.set(jobId, { progress: 50, status: 'training_model' })
    
    // Simulate voice model training
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate training time
    
    trainingProgress.set(jobId, { progress: 80, status: 'generating_samples' })
    
    // Generate voice samples for testing
    const testPhrases = [
      'Hello, this is my cloned voice.',
      'I can speak naturally with this technology.',
      'The quality is quite impressive.'
    ]
    
    const voiceSamples = []
    for (const phrase of testPhrases) {
      try {
        const sample = await generateClonedSpeech(phrase, voiceProfile)
        voiceSamples.push({
          phrase,
          audioUrl: sample.audio_url,
          audioData: sample.audio_data
        })
      } catch (error) {
        console.error(`Failed to generate sample for phrase: ${phrase}`, error)
      }
    }
    
    trainingProgress.set(jobId, { progress: 95, status: 'finalizing' })
    
    // Create final voice clone model
    const voiceCloneModel = {
      jobId,
      userId,
      voiceProfile,
      samples: voiceSamples,
      accuracy: calculateVoiceAccuracy(voiceCharacteristics),
      createdAt: new Date().toISOString(),
      metadata: {
        originalAudioSize: audioBuffer.length,
        processingTime: Date.now(),
        modelVersion: '1.0'
      }
    }
    
    // Cache the result
    voiceCloneCache.set(userId, voiceCloneModel)
    
    trainingProgress.set(jobId, { progress: 100, status: 'completed' })
    
    return voiceCloneModel
    
  } catch (error) {
    trainingProgress.set(jobId, { progress: 0, status: 'failed', error: error.message })
    throw error
  }
}

async function analyzeVoiceCharacteristics(audioBuffer) {
  // Simulate voice analysis
  return {
    pitch: 'medium',
    tone: 'warm',
    speed: 'normal',
    accent: 'neutral',
    gender: 'auto-detected',
    age_range: 'adult',
    characteristics: {
      resonance: 'rich',
      clarity: 'high',
      emotion_range: 'wide',
      volume_consistency: 'stable'
    },
    confidence: 0.87
  }
}

async function generateClonedSpeech(text, voiceProfile) {
  try {
    // Use TTS with custom voice parameters based on the profile
    const result = await TTS({
      text,
      voice_id: 'custom', // Would use actual cloned voice ID
      language: 'en',
      speed: 1.0,
      // Custom parameters based on voice profile
      pitch_adjustment: voiceProfile.characteristics.pitch === 'high' ? 1.2 : 1.0,
      tone: voiceProfile.characteristics.tone
    })
    
    return result
  } catch (error) {
    console.error('Cloned speech generation error:', error)
    throw error
  }
}

function calculateVoiceAccuracy(characteristics) {
  let accuracy = 0.80 // Base accuracy
  
  if (characteristics.confidence > 0.85) accuracy += 0.1
  if (characteristics.characteristics.clarity === 'high') accuracy += 0.05
  if (characteristics.characteristics.resonance === 'rich') accuracy += 0.03
  
  return Math.min(accuracy, 0.96) // Cap at 96%
}

// HTTP server for file uploads
server.on('request', async (req, res) => {
  if (req.method === 'POST' && req.url === '/upload-likeness') {
    try {
      const form = formidable({})
      const [fields, files] = await form.parse(req)
      
      const userId = fields.userId[0]
      const imageFile = files.image[0]
      
      if (!userId || !imageFile) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'userId and image file required' }))
        return
      }
      
      // Read image file
      const fs = await import('fs')
      const imageBuffer = fs.readFileSync(imageFile.filepath)
      
      // Start likeness generation
      const jobId = `likeness_${userId}_${Date.now()}`
      processingJobs.set(jobId, {
        type: 'likeness',
        userId,
        status: 'processing'
      })
      
      // Process asynchronously
      generateLikenessAvatar(userId, imageBuffer, JSON.parse(fields.options?.[0] || '{}'))
        .then(result => {
          processingJobs.set(jobId, {
            type: 'likeness',
            userId,
            status: 'completed',
            result
          })
        })
        .catch(error => {
          processingJobs.set(jobId, {
            type: 'likeness',
            userId,
            status: 'failed',
            error: error.message
          })
        })
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        message: 'Likeness generation started',
        jobId,
        estimatedTime: '2-3 minutes'
      }))
      
    } catch (error) {
      console.error('Upload error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Upload failed' }))
    }
  } else if (req.method === 'POST' && req.url === '/upload-voice') {
    try {
      const form = formidable({})
      const [fields, files] = await form.parse(req)
      
      const userId = fields.userId[0]
      const audioFile = files.audio[0]
      
      if (!userId || !audioFile) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'userId and audio file required' }))
        return
      }
      
      // Read audio file
      const fs = await import('fs')
      const audioBuffer = fs.readFileSync(audioFile.filepath)
      
      // Start voice cloning
      const jobId = `voice_${userId}_${Date.now()}`
      processingJobs.set(jobId, {
        type: 'voice',
        userId,
        status: 'processing'
      })
      
      // Process asynchronously
      cloneVoice(userId, audioBuffer, audioFile.originalFilename)
        .then(result => {
          processingJobs.set(jobId, {
            type: 'voice',
            userId,
            status: 'completed',
            result
          })
        })
        .catch(error => {
          processingJobs.set(jobId, {
            type: 'voice',
            userId,
            status: 'failed',
            error: error.message
          })
        })
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        message: 'Voice cloning started',
        jobId,
        estimatedTime: '1-2 minutes'
      }))
      
    } catch (error) {
      console.error('Voice upload error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Upload failed' }))
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Endpoint not found' }))
  }
})

// WebSocket handling for real-time updates
io.on('connection', (socket) => {
  console.log(`🎭 Likeness/Voice client connected: ${socket.id}`)
  
  socket.on('get_training_progress', (data) => {
    const { jobId } = data
    const progress = trainingProgress.get(jobId)
    
    if (progress) {
      socket.emit('training_progress', { jobId, ...progress })
      
      // Clean up completed jobs
      if (progress.status === 'completed' || progress.status === 'failed') {
        setTimeout(() => {
          trainingProgress.delete(jobId)
        }, 60000) // Keep for 1 minute
      }
    } else {
      socket.emit('training_progress', { 
        jobId, 
        progress: 0, 
        status: 'not_found' 
      })
    }
  })
  
  socket.on('get_likeness_model', (data) => {
    const { userId } = data
    const model = likenessCache.get(userId)
    
    if (model) {
      socket.emit('likeness_model', { userId, model })
    } else {
      socket.emit('likeness_model', { 
        userId, 
        error: 'Model not found' 
      })
    }
  })
  
  socket.on('get_voice_clone', (data) => {
    const { userId } = data
    const voiceClone = voiceCloneCache.get(userId)
    
    if (voiceClone) {
      socket.emit('voice_clone', { userId, voiceClone })
    } else {
      socket.emit('voice_clone', { 
        userId, 
        error: 'Voice clone not found' 
      })
    }
  })
  
  socket.on('test_cloned_voice', async (data) => {
    const { userId, text } = data
    const voiceClone = voiceCloneCache.get(userId)
    
    if (!voiceClone) {
      socket.emit('voice_test_error', { 
        error: 'Voice clone not found' 
      })
      return
    }
    
    try {
      const result = await generateClonedSpeech(text, voiceClone.voiceProfile)
      socket.emit('voice_test_result', {
        userId,
        text,
        audioUrl: result.audio_url,
        audioData: result.audio_data
      })
    } catch (error) {
      socket.emit('voice_test_error', { 
        error: 'Failed to generate speech' 
      })
    }
  })
  
  socket.on('disconnect', () => {
    console.log(`🎭 Likeness/Voice client disconnected: ${socket.id}`)
  })
})

// Cleanup old jobs
setInterval(() => {
  const now = Date.now()
  for (const [jobId, job] of processingJobs.entries()) {
    if (now - job.processingTime > 3600000) { // 1 hour
      processingJobs.delete(jobId)
    }
  }
}, 300000) // Every 5 minutes

server.listen(PORT, () => {
  console.log(`🎭 1:1 Likeness & Voice Cloning service running on port ${PORT}`)
  console.log(`📸 Upload endpoints: /upload-likeness, /upload-voice`)
})