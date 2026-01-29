import { io, Socket } from 'socket.io-client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  TalkAvatarConfig,
  Avatar,
  Session,
  Message,
  VoiceCloneProgress,
  LikenessProgress,
  TalkAvatarEvents,
  DevicePermissions,
  RecordingOptions,
  VideoGenerationOptions,
  LikenessOptions
} from './types'

export class TalkAvatarSDK {
  private config: TalkAvatarConfig
  private socket: Socket | null = null
  private eventListeners: Map<keyof TalkAvatarEvents, Function[]> = new Map()
  private currentSession: Session | null = null
  private isRecording = false
  private isConnected = false

  constructor(config: TalkAvatarConfig) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      wsUrl: 'http://localhost:3001',
      enableVoiceInput: true,
      enableCameraInput: false,
      enableNotifications: true,
      logLevel: 'info',
      ...config
    }
  }

  // Initialize the SDK
  async initialize(): Promise<void> {
    try {
      this.log('Initializing TalkAvatar SDK...')
      
      // Check permissions
      if (this.config.enableVoiceInput) {
        await this.requestAudioPermission()
      }
      
      if (this.config.enableCameraInput) {
        await this.requestCameraPermission()
      }
      
      // Connect to WebSocket
      await this.connect()
      
      this.log('SDK initialized successfully')
    } catch (error) {
      this.logError('Failed to initialize SDK:', error)
      throw error
    }
  }

  // Connect to WebSocket server
  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socketUrl = `${this.config.wsUrl}?XTransformPort=3001`
      
      this.socket = io(socketUrl, {
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        this.log('Connected to TalkAvatar server')
        this.emit('connection:status', true)
        resolve()
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        this.log('Disconnected from TalkAvatar server')
        this.emit('connection:status', false)
      })

      this.socket.on('error', (error) => {
        this.logError('Socket error:', error)
        this.emit('error', error)
        reject(error)
      })

      // Set up event listeners
      this.setupEventListeners()
    })
  }

  // Setup WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('session_started', (data) => {
      this.currentSession = data.session
      this.emit('session:started', data.session)
    })

    this.socket.on('message', (message) => {
      this.emit('message:received', message)
    })

    this.socket.on('audio_transcription', (data) => {
      this.emit('audio:transcription', data.text, data.confidence)
    })

    this.socket.on('training_progress', (data) => {
      if (data.jobId.startsWith('voice_')) {
        this.emit('voice:clone-progress', data as VoiceCloneProgress)
      } else if (data.jobId.startsWith('likeness_')) {
        this.emit('likeness:progress', data as LikenessProgress)
      }
    })

    this.socket.on('avatar_ready', (avatar) => {
      this.emit('avatar:ready', avatar)
    })
  }

  // Get available avatars
  async getAvatars(): Promise<Avatar[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/avatars`)
      if (!response.ok) throw new Error('Failed to fetch avatars')
      
      const data = await response.json()
      return data.avatars || []
    } catch (error) {
      this.logError('Failed to get avatars:', error)
      throw error
    }
  }

  // Start a conversation session
  async startSession(avatarId: string, language = 'en'): Promise<Session> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server')
    }

    return new Promise((resolve, reject) => {
      const userId = await this.getUserId()
      
      this.socket!.emit('start_session', {
        avatarId,
        userId,
        language
      })

      const timeout = setTimeout(() => {
        reject(new Error('Session start timeout'))
      }, 10000)

      const onSessionStarted = (session: Session) => {
        clearTimeout(timeout)
        this.currentSession = session
        resolve(session)
      }

      this.once('session:started', onSessionStarted)
    })
  }

  // Send a text message
  async sendMessage(content: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session')
    }

    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to server')
    }

    const message: Partial<Message> = {
      sessionId: this.currentSession.id,
      content,
      messageType: 'user',
      timestamp: new Date().toISOString()
    }

    this.socket.emit('message', {
      sessionId: this.currentSession.sessionId,
      content,
      messageType: 'user'
    })

    this.emit('message:sent', message as Message)
  }

  // Start voice recording
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    if (!this.config.enableVoiceInput) {
      throw new Error('Voice input is disabled')
    }

    if (this.isRecording) {
      throw new Error('Already recording')
    }

    try {
      // In a real implementation, this would use react-native-audio-recorder-player
      this.isRecording = true
      this.log('Started voice recording')
      
      // Simulate recording - in real implementation, handle actual audio recording
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording()
        }
      }, (options.maxDuration || 30) * 1000)
      
    } catch (error) {
      this.logError('Failed to start recording:', error)
      throw error
    }
  }

  // Stop voice recording
  async stopRecording(): Promise<void> {
    if (!this.isRecording) {
      throw new Error('Not recording')
    }

    try {
      this.isRecording = false
      this.log('Stopped voice recording')
      
      // In a real implementation, this would:
      // 1. Stop the audio recorder
      // 2. Get the recorded audio buffer
      // 3. Send it to the server for transcription
      
      // For now, simulate sending audio
      if (this.socket && this.currentSession) {
        this.socket.emit('stream_audio', {
          sessionId: this.currentSession.sessionId,
          audioChunk: new ArrayBuffer(1024), // Mock audio data
          sequence: Date.now()
        })
      }
      
    } catch (error) {
      this.logError('Failed to stop recording:', error)
      throw error
    }
  }

  // Upload image for 1:1 likeness generation
  async uploadLikeness(
    userId: string, 
    imageUri: string, 
    options: LikenessOptions = {}
  ): Promise<{ jobId: string; estimatedTime: string }> {
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      
      // In React Native, we'd use react-native-fs to read the file
      // For now, simulate the upload
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'likeness.jpg'
      } as any)
      
      formData.append('options', JSON.stringify(options))

      const response = await fetch(`${this.config.baseUrl}/api/likeness/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload likeness')

      return await response.json()
    } catch (error) {
      this.logError('Failed to upload likeness:', error)
      throw error
    }
  }

  // Upload audio for voice cloning
  async uploadVoiceClone(userId: string, audioUri: string): Promise<{ jobId: string; estimatedTime: string }> {
    try {
      const formData = new FormData()
      formData.append('userId', userId)
      
      // In React Native, we'd use react-native-fs to read the file
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice-sample.m4a'
      } as any)

      const response = await fetch(`${this.config.baseUrl}/api/voice-clone/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload voice sample')

      return await response.json()
    } catch (error) {
      this.logError('Failed to upload voice sample:', error)
      throw error
    }
  }

  // Generate video from script
  async generateVideo(
    avatarId: string,
    script: string,
    options: VideoGenerationOptions = {}
  ): Promise<{ videoId: string; estimatedTime: string }> {
    try {
      const userId = await this.getUserId()
      
      const response = await fetch(`${this.config.baseUrl}/api/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Mobile Generated Video',
          script,
          avatarId,
          userId,
          resolution: options.resolution || '1080p',
          backgroundType: options.backgroundType || 'solid',
          backgroundColor: options.backgroundColor || '#ffffff'
        })
      })

      if (!response.ok) throw new Error('Failed to generate video')

      const result = await response.json()
      return {
        videoId: result.video.id,
        estimatedTime: '2-5 minutes'
      }
    } catch (error) {
      this.logError('Failed to generate video:', error)
      throw error
    }
  }

  // Get device permissions
  async getPermissions(): Promise<DevicePermissions> {
    // In a real implementation, this would use react-native-permissions
    return {
      audio: 'granted',
      camera: 'granted'
    }
  }

  // Request audio permission
  private async requestAudioPermission(): Promise<AudioPermission> {
    // In a real implementation, this would use react-native-permissions
    return 'granted'
  }

  // Request camera permission
  private async requestCameraPermission(): Promise<CameraPermission> {
    // In a real implementation, this would use react-native-permissions
    return 'granted'
  }

  // Get stored user ID
  private async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem('talkavatar_user_id')
      if (!userId) {
        const newUserId = `mobile_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await AsyncStorage.setItem('talkavatar_user_id', newUserId)
        return newUserId
      }
      return userId
    } catch (error) {
      this.logError('Failed to get user ID:', error)
      return `mobile_user_${Date.now()}`
    }
  }

  // Event handling
  on<K extends keyof TalkAvatarEvents>(event: K, listener: TalkAvatarEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off<K extends keyof TalkAvatarEvents>(event: K, listener: TalkAvatarEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit<K extends keyof TalkAvatarEvents>(event: K, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          this.logError(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  private once<K extends keyof TalkAvatarEvents>(event: K, listener: TalkAvatarEvents[K]): void {
    const onceListener = (...args: any[]) => {
      listener(...args)
      this.off(event, onceListener)
    }
    this.on(event, onceListener)
  }

  // End current session
  async endSession(): Promise<void> {
    if (this.currentSession && this.socket) {
      this.socket.emit('end_session', {
        sessionId: this.currentSession.sessionId
      })
      this.currentSession = null
    }
  }

  // Disconnect from server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.currentSession = null
  }

  // Get connection status
  isSocketConnected(): boolean {
    return this.isConnected
  }

  // Get current session
  getCurrentSession(): Session | null {
    return this.currentSession
  }

  // Check if recording
  isVoiceRecording(): boolean {
    return this.isRecording
  }

  // Logging
  private log(message: string, ...args: any[]): void {
    if (this.config.logLevel && ['info', 'debug'].includes(this.config.logLevel)) {
      console.log(`[TalkAvatarSDK] ${message}`, ...args)
    }
  }

  private logError(message: string, ...args: any[]): void {
    if (this.config.logLevel && this.config.logLevel !== 'none') {
      console.error(`[TalkAvatarSDK ERROR] ${message}`, ...args)
    }
  }
}

// Export convenience function
export function createTalkAvatarSDK(config: TalkAvatarConfig): TalkAvatarSDK {
  return new TalkAvatarSDK(config)
}

// Export types
export * from './types'