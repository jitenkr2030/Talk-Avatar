# TalkAvatar Mobile SDK

Native mobile SDK for integrating TalkAvatar avatar interactions into React Native applications.

## Features

- 🎭 **1:1 Avatar Likeness** - Upload photos to create realistic avatar clones
- 🗣️ **Voice Cloning** - Clone your voice for personalized avatar speech
- ⚡ **Real-time Conversation** - Ultra-low latency avatar interactions
- 📱 **Native Mobile** - Optimized for iOS and Android
- 🎙️ **Voice Input** - Built-in speech recognition
- 📹 **Video Generation** - Create avatar videos from scripts
- 🔊 **Audio Playback** - High-quality audio streaming
- 📊 **Progress Tracking** - Real-time progress for long-running operations

## Installation

```bash
npm install talkavatar-mobile-sdk
# or
yarn add talkavatar-mobile-sdk
```

## Peer Dependencies

Make sure you have these installed in your React Native project:

```bash
npm install socket.io-client react-native-fs react-native-sound react-native-video react-native-permissions @react-native-async-storage/async-storage
```

## Quick Start

```typescript
import TalkAvatarSDK, { createTalkAvatarSDK } from 'talkavatar-mobile-sdk'

// Initialize the SDK
const sdk = createTalkAvatarSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-talkavatar-server.com',
  wsUrl: 'wss://your-talkavatar-server.com',
  enableVoiceInput: true,
  enableCameraInput: false
})

// Initialize and start using
async function initializeApp() {
  try {
    await sdk.initialize()
    
    // Get available avatars
    const avatars = await sdk.getAvatars()
    
    // Start a conversation
    const session = await sdk.startSession(avatars[0].id)
    
    // Send a message
    await sdk.sendMessage('Hello, avatar!')
    
    // Start voice recording
    await sdk.startRecording()
    
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}
```

## API Reference

### Initialization

```typescript
const sdk = new TalkAvatarSDK({
  apiKey: string,              // Required - Your API key
  baseUrl?: string,            // Optional - API server URL
  wsUrl?: string,              // Optional - WebSocket server URL
  enableVoiceInput?: boolean,  // Optional - Enable voice recording (default: true)
  enableCameraInput?: boolean, // Optional - Enable camera access (default: false)
  enableNotifications?: boolean, // Optional - Enable push notifications (default: true)
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug' // Optional - Log level
})
```

### Methods

#### `initialize(): Promise<void>`
Initialize the SDK and request necessary permissions.

```typescript
await sdk.initialize()
```

#### `getAvatars(): Promise<Avatar[]>`
Get list of available avatars.

```typescript
const avatars = await sdk.getAvatars()
console.log(avatars[0].name) // "Sarah - Customer Support"
```

#### `startSession(avatarId: string, language?: string): Promise<Session>`
Start a conversation session with an avatar.

```typescript
const session = await sdk.startSession('avatar-123', 'en')
console.log('Session started:', session.id)
```

#### `sendMessage(content: string): Promise<void>`
Send a text message to the avatar.

```typescript
await sdk.sendMessage('How can you help me today?')
```

#### `startRecording(options?: RecordingOptions): Promise<void>`
Start voice recording for speech input.

```typescript
await sdk.startRecording({
  maxDuration: 30,        // Maximum recording duration in seconds
  quality: 'high',        // Audio quality: 'low' | 'medium' | 'high'
  format: 'wav',          // Audio format: 'wav' | 'mp3' | 'm4a'
  silenceThreshold: 0.1   // Silence detection threshold (0-1)
})
```

#### `stopRecording(): Promise<void>`
Stop voice recording and send for transcription.

```typescript
await sdk.stopRecording()
```

#### `uploadLikeness(userId: string, imageUri: string, options?: LikenessOptions): Promise<{jobId: string, estimatedTime: string}>`
Upload a photo to create a 1:1 avatar likeness.

```typescript
const result = await sdk.uploadLikeness('user-123', 'file:///path/to/photo.jpg', {
  style: 'professional',    // 'professional' | 'casual' | 'artistic'
  background: 'studio',      // 'studio' | 'outdoor' | 'minimal'
  lighting: 'soft',          // 'soft' | 'dramatic' | 'natural'
  includeExpressions: true,  // Generate expression variations
  variations: 3              // Number of avatar variations (1-5)
})

console.log('Likeness job ID:', result.jobId)
```

#### `uploadVoiceClone(userId: string, audioUri: string): Promise<{jobId: string, estimatedTime: string}>`
Upload audio sample to create a voice clone.

```typescript
const result = await sdk.uploadVoiceClone('user-123', 'file:///path/to/voice.m4a')
console.log('Voice clone job ID:', result.jobId)
```

#### `generateVideo(avatarId: string, script: string, options?: VideoGenerationOptions): Promise<{videoId: string, estimatedTime: string}>`
Generate a video from script using an avatar.

```typescript
const result = await sdk.generateVideo('avatar-123', 'Welcome to our platform!', {
  resolution: '1080p',       // '720p' | '1080p' | '4k'
  backgroundType: 'solid',   // 'solid' | 'image' | 'video'
  backgroundColor: '#ffffff', // Background color for solid backgrounds
  quality: 'high',           // 'low' | 'medium' | 'high'
  format: 'mp4'              // 'mp4' | 'webm'
})

console.log('Video generation started:', result.videoId)
```

### Events

Listen to SDK events using the `on` method:

```typescript
// Session events
sdk.on('session:started', (session) => {
  console.log('Session started:', session.id)
})

sdk.on('session:ended', (sessionId) => {
  console.log('Session ended:', sessionId)
})

// Message events
sdk.on('message:received', (message) => {
  console.log('Received message:', message.content)
})

sdk.on('message:sent', (message) => {
  console.log('Sent message:', message.content)
})

// Voice events
sdk.on('audio:transcription', (text, confidence) => {
  console.log(`Transcription: ${text} (${confidence}% confidence)`)
})

// Progress events
sdk.on('voice:clone-progress', (progress) => {
  console.log(`Voice cloning: ${progress.progress}% - ${progress.status}`)
})

sdk.on('likeness:progress', (progress) => {
  console.log(`Likeness generation: ${progress.progress}% - ${progress.status}`)
})

// Avatar events
sdk.on('avatar:ready', (avatar) => {
  console.log('Avatar ready:', avatar.name)
})

// Connection events
sdk.on('connection:status', (connected) => {
  console.log('Connection status:', connected)
})

// Error events
sdk.on('error', (error) => {
  console.error('SDK Error:', error)
})
```

### Remove Event Listeners

```typescript
const handleMessage = (message) => console.log(message)

// Add listener
sdk.on('message:received', handleMessage)

// Remove specific listener
sdk.off('message:received', handleMessage)

// Or remove all listeners (not recommended)
sdk.off('message:received')
```

## Example Components

### Conversation Component

```typescript
import React, { useState, useEffect } from 'react'
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native'
import TalkAvatarSDK from 'talkavatar-mobile-sdk'

export const ConversationScreen = () => {
  const [sdk] = useState(() => new TalkAvatarSDK({
    apiKey: 'your-api-key'
  }))
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    initializeSDK()
  }, [])

  const initializeSDK = async () => {
    await sdk.initialize()
    
    // Set up event listeners
    sdk.on('message:received', (message) => {
      setMessages(prev => [...prev, message])
    })

    sdk.on('audio:transcription', (text) => {
      setInputText(text)
    })
  }

  const sendMessage = async () => {
    if (inputText.trim()) {
      await sdk.sendMessage(inputText)
      setInputText('')
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await sdk.stopRecording()
      setIsRecording(false)
    } else {
      await sdk.startRecording()
      setIsRecording(true)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {messages.map((message, index) => (
          <View key={index} style={{ 
            padding: 10, 
            margin: 5,
            backgroundColor: message.messageType === 'user' ? '#e3f2fd' : '#f3e5f5',
            alignSelf: message.messageType === 'user' ? 'flex-end' : 'flex-start',
            borderRadius: 10
          }}>
            <Text>{message.content}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', padding: 10 }}>
        <TextInput
          style={{ 
            flex: 1, 
            borderWidth: 1, 
            borderColor: '#ccc', 
            borderRadius: 5,
            paddingHorizontal: 10,
            marginRight: 10
          }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        
        <TouchableOpacity
          style={{
            backgroundColor: isRecording ? '#f44336' : '#4caf50',
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 5,
            marginRight: 5
          }}
          onPress={toggleRecording}
        >
          <Text style={{ color: 'white' }}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#2196f3',
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 5
          }}
          onPress={sendMessage}
        >
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
```

### Avatar Creation Component

```typescript
import React, { useState } from 'react'
import { View, TouchableOpacity, Text, Image, Progress } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import TalkAvatarSDK from 'talkavatar-mobile-sdk'

export const AvatarCreationScreen = () => {
  const [sdk] = useState(() => new TalkAvatarSDK({ apiKey: 'your-api-key' }))
  const [likenessProgress, setLikenessProgress] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    sdk.initialize()
    
    sdk.on('likeness:progress', (progress) => {
      setLikenessProgress(progress.progress)
    })
  }, [])

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0])
      }
    })
  }

  const createLikeness = async () => {
    if (!selectedImage) return

    try {
      const result = await sdk.uploadLikeness('user-123', selectedImage.uri, {
        style: 'professional',
        includeExpressions: true,
        variations: 3
      })
      
      console.log('Likeness creation started:', result.jobId)
    } catch (error) {
      console.error('Failed to create likeness:', error)
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Create Your Avatar
      </Text>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage.uri }}
          style={{ width: 200, height: 200, alignSelf: 'center', marginBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={{
          backgroundColor: '#2196f3',
          padding: 15,
          borderRadius: 5,
          marginBottom: 20
        }}
        onPress={selectImage}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {selectedImage ? 'Change Photo' : 'Select Photo'}
        </Text>
      </TouchableOpacity>

      {selectedImage && (
        <TouchableOpacity
          style={{
            backgroundColor: '#4caf50',
            padding: 15,
            borderRadius: 5,
            marginBottom: 20
          }}
          onPress={createLikeness}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Create 1:1 Likeness
          </Text>
        </TouchableOpacity>
      )}

      {likenessProgress > 0 && (
        <View>
          <Text style={{ marginBottom: 10 }}>
            Creating Avatar: {likenessProgress}%
          </Text>
          <Progress 
            value={likenessProgress} 
            color="#4caf50"
          />
        </View>
      )}
    </View>
  )
}
```

## Permissions

Add these permissions to your `AndroidManifest.xml` (Android) and `Info.plist` (iOS):

### Android
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice interactions with avatars</string>
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera for avatar creation features</string>
```

## Error Handling

The SDK emits errors through the `error` event. Always handle errors gracefully:

```typescript
sdk.on('error', (error) => {
  console.error('SDK Error:', error)
  
  // Show user-friendly error message
  Alert.alert('Error', 'Something went wrong. Please try again.')
  
  // Implement retry logic if needed
  if (error.message.includes('connection')) {
    setTimeout(() => {
      sdk.initialize()
    }, 5000)
  }
})
```

## Best Practices

1. **Initialize Early**: Initialize the SDK when your app starts
2. **Handle Permissions**: Check and request permissions before using voice/camera features
3. **Manage Connection**: Monitor connection status and handle reconnection
4. **Clean Up**: Disconnect the SDK when your app closes
5. **Error Handling**: Always implement proper error handling
6. **Progress Tracking**: Show progress indicators for long-running operations
7. **Memory Management**: Remove event listeners when components unmount

## Support

For issues and questions:
- GitHub: [TalkAvatar Issues](https://github.com/jitenkr2030/Talk-Avatar/issues)
- Documentation: [TalkAvatar Docs](https://docs.talkavatar.com)
- Email: support@talkavatar.com

## License

MIT License - see LICENSE file for details.