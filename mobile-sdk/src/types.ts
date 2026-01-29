export interface TalkAvatarConfig {
  apiKey: string
  baseUrl?: string
  wsUrl?: string
  enableVoiceInput?: boolean
  enableCameraInput?: boolean
  enableNotifications?: boolean
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
}

export interface Avatar {
  id: string
  name: string
  description?: string
  imageUrl?: string
  voiceId?: string
  language: string
  personality?: string
  role?: string
  isReady: boolean
  accuracy?: number
}

export interface Session {
  id: string
  sessionId: string
  avatarId: string
  status: 'active' | 'ended' | 'error'
  startTime: string
  messageCount: number
  totalCost: number
  language: string
}

export interface Message {
  id: string
  sessionId: string
  content: string
  messageType: 'user' | 'assistant' | 'system'
  audioUrl?: string
  videoUrl?: string
  emotion?: string
  confidence?: number
  processingTime?: number
  timestamp: string
}

export interface VoiceCloneProgress {
  jobId: string
  progress: number
  status: 'processing' | 'completed' | 'failed'
  message?: string
  error?: string
}

export interface LikenessProgress {
  jobId: string
  progress: number
  status: 'extracting_features' | 'analyzing_features' | 'generating_base_avatar' | 'generating_variation_1' | 'generating_variation_2' | 'generating_variation_3' | 'creating_expressions' | 'finalizing' | 'completed' | 'failed'
  message?: string
  error?: string
}

export interface TalkAvatarEvents {
  'session:started': (session: Session) => void
  'session:ended': (sessionId: string) => void
  'message:received': (message: Message) => void
  'message:sent': (message: Message) => void
  'audio:transcription': (text: string, confidence: number) => void
  'voice:clone-progress': (progress: VoiceCloneProgress) => void
  'likeness:progress': (progress: LikenessProgress) => void
  'avatar:ready': (avatar: Avatar) => void
  'error': (error: Error) => void
  'connection:status': (connected: boolean) => void
}

export type AudioPermission = 'granted' | 'denied' | 'restricted'
export type CameraPermission = 'granted' | 'denied' | 'restricted'

export interface DevicePermissions {
  audio: AudioPermission
  camera: CameraPermission
}

export interface RecordingOptions {
  maxDuration?: number // in seconds
  quality?: 'low' | 'medium' | 'high'
  format?: 'wav' | 'mp3' | 'm4a'
  silenceThreshold?: number // 0-1
}

export interface VideoGenerationOptions {
  resolution?: '720p' | '1080p' | '4k'
  backgroundType?: 'solid' | 'image' | 'video'
  backgroundColor?: string
  quality?: 'low' | 'medium' | 'high'
  format?: 'mp4' | 'webm'
}

export interface LikenessOptions {
  style?: 'professional' | 'casual' | 'artistic'
  background?: 'studio' | 'outdoor' | 'minimal'
  lighting?: 'soft' | 'dramatic' | 'natural'
  includeExpressions?: boolean
  variations?: number // 1-5
}