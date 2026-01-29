import React from 'react'
import TalkAvatarSDK, { createTalkAvatarSDK } from '../src'

// Example usage for documentation
const BasicExample = () => {
  const sdk = createTalkAvatarSDK({
    apiKey: 'demo-api-key',
    baseUrl: 'https://api.talkavatar.com',
    wsUrl: 'wss://realtime.talkavatar.com',
    enableVoiceInput: true,
    enableCameraInput: false,
    logLevel: 'info'
  })

  const initializeExample = async () => {
    try {
      await sdk.initialize()
      
      // Get avatars
      const avatars = await sdk.getAvatars()
      
      // Start session
      const session = await sdk.startSession(avatars[0].id, 'en')
      
      // Send message
      await sdk.sendMessage('Hello, avatar!')
      
      // Start voice recording
      await sdk.startRecording({
        maxDuration: 30,
        quality: 'high',
        format: 'wav'
      })
      
      // Upload likeness
      const likenessResult = await sdk.uploadLikeness(
        'user-123',
        'file:///path/to/photo.jpg',
        {
          style: 'professional',
          background: 'studio',
          lighting: 'soft',
          includeExpressions: true,
          variations: 3
        }
      )
      
      // Upload voice clone
      const voiceResult = await sdk.uploadVoiceClone(
        'user-123',
        'file:///path/to/voice.m4a'
      )
      
      // Generate video
      const videoResult = await sdk.generateVideo(
        'avatar-123',
        'Welcome to our platform!',
        {
          resolution: '1080p',
          backgroundType: 'solid',
          backgroundColor: '#ffffff',
          quality: 'high',
          format: 'mp4'
        }
      )
      
    } catch (error) {
      console.error('Example error:', error)
    }
  }

  // Event handling examples
  sdk.on('session:started', (session) => {
    console.log('Session started:', session.id)
  })

  sdk.on('message:received', (message) => {
    console.log('Received:', message.content)
  })

  sdk.on('audio:transcription', (text, confidence) => {
    console.log(`Transcription: ${text} (${confidence}%)`)
  })

  sdk.on('voice:clone-progress', (progress) => {
    console.log(`Voice cloning: ${progress.progress}%`)
  })

  sdk.on('likeness:progress', (progress) => {
    console.log(`Likeness: ${progress.progress}%`)
  })

  sdk.on('connection:status', (connected) => {
    console.log('Connected:', connected)
  })

  sdk.on('error', (error) => {
    console.error('SDK Error:', error)
  })

  return null
}

export default BasicExample