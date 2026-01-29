# 🧠 TalkAvatar - Real-Time AI Talking Avatars Platform

A comprehensive Next.js platform for creating, managing, and interacting with AI-powered talking avatars. Built with modern web technologies and integrated with advanced AI capabilities.

## ✨ Features

### 🎭 Avatar Creation & Management
- **Photo-based avatar creation** - Upload images to create realistic avatars
- **Video-based high-accuracy training** - Use videos for enhanced avatar accuracy
- **Multiple avatars per user** - Create and manage multiple avatar personalities
- **Customization options** - Configure appearance, voice, personality, and role
- **Training status tracking** - Monitor avatar training progress and accuracy

### 💬 Real-Time Voice Conversation
- **Live voice interaction** - Natural two-way conversations with avatars
- **Low-latency responses** - Optimized for real-time communication
- **Speech-to-Text (ASR)** - Accurate voice recognition with noise robustness
- **Text-to-Speech (TTS)** - Natural voice generation with multiple options
- **WebSocket streaming** - Real-time audio and video streaming

### 🎬 Lip Sync & Facial Animation
- **Realistic lip synchronization** - Audio-driven lip movement generation
- **Emotion-based expressions** - Facial expressions that match speech emotions
- **Natural animations** - Eye blinking, head movements, and micro-expressions
- **Real-time rendering** - Smooth video stream output

### 🤖 AI Conversation Intelligence
- **Context-aware conversations** - Memory-based responses with context tracking
- **Multi-language support** - Understanding and response in multiple languages
- **Role-based personalities** - Configure avatars for specific roles (teacher, support, guide)
- **Knowledge integration** - Connect to external knowledge bases

### 🎥 Text-to-Video Generation
- **Script-to-video conversion** - Turn text scripts into avatar videos
- **Multiple use cases** - Marketing, training, and explainer content
- **Customizable output** - Control resolution, background, and style
- **Export options** - Download videos in MP4/WebM formats

### 📹 Camera & Vision Intelligence
- **User presence detection** - Detect when users are present
- **Emotion recognition** - Understand user emotions and engagement
- **Privacy-first processing** - Local processing options for sensitive data
- **Adaptive interactions** - Responses based on visual cues

### 🔌 API & SDK Platform
- **REST APIs** - Complete RESTful API for all platform features
- **WebSocket APIs** - Real-time communication endpoints
- **SDK support** - Web, Mobile, and Desktop integration
- **API key management** - Secure authentication and rate limiting

### 📊 Web Dashboard
- **User management panel** - Comprehensive user and avatar management
- **Session monitoring** - Real-time session tracking and analytics
- **Usage analytics** - Detailed usage and billing information
- **Admin controls** - Full administrative capabilities

### 🔒 Security & Privacy
- **Data encryption** - End-to-end encryption for all data
- **GDPR compliance** - Privacy-first architecture
- **Access control** - Role-based permissions and access management
- **Data retention policies** - Configurable data handling policies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Bun
- SQLite database (included)
- Modern web browser with WebRTC support

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd talkavatar
   bun install
   ```

2. **Setup database**
   ```bash
   bun run db:push
   ```

3. **Start services**
   ```bash
   # Start main application
   bun run dev
   
   # Start avatar chat service (in another terminal)
   cd mini-services/avatar-chat
   bun run dev
   
   # Start video generator service (in another terminal)
   cd mini-services/video-generator
   bun run dev
   ```

4. **Access the application**
   - Main dashboard: http://localhost:3000
   - Avatar chat service: ws://localhost:3001
   - Video generator: ws://localhost:3002

## 🏗️ Architecture

### Frontend (Next.js 16)
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand + TanStack Query
- **TypeScript**: Full TypeScript support

### Backend Services
- **Main API**: Next.js API routes
- **Avatar Chat Service**: WebSocket service on port 3001
- **Video Generator Service**: Background processing on port 3002
- **Database**: SQLite with Prisma ORM

### AI Integration
- **LLM**: Large Language Model for conversations
- **TTS**: Text-to-Speech for voice generation
- **ASR**: Automatic Speech Recognition
- **Image Generation**: Avatar frame creation
- **Video Generation**: Video assembly and processing

## 📚 API Documentation

### Authentication
```bash
# Create user
POST /api/users
{
  "email": "user@example.com",
  "name": "John Doe"
}

# Create API key
POST /api/api-keys
{
  "name": "Production Key",
  "userId": "user_id",
  "permissions": "read"
}
```

### Avatar Management
```bash
# Get user avatars
GET /api/avatars?userId=user_id

# Create avatar
POST /api/avatars
{
  "name": "Sarah - Customer Support",
  "description": "Friendly support avatar",
  "userId": "user_id",
  "language": "en",
  "gender": "female"
}
```

### Sessions & Conversations
```bash
# Create session
POST /api/sessions
{
  "avatarId": "avatar_id",
  "userId": "user_id",
  "language": "en"
}

# Send message
POST /api/sessions/session_id/messages
{
  "content": "Hello, how can you help me?",
  "messageType": "user"
}
```

### Video Generation
```bash
# Generate video
POST /api/videos
{
  "title": "Welcome Video",
  "script": "Welcome to our platform...",
  "avatarId": "avatar_id",
  "userId": "user_id",
  "resolution": "1080p"
}
```

### WebSocket Events
```javascript
// Connect to avatar chat
const socket = io('/?XTransformPort=3001');

// Start session
socket.emit('start_session', {
  avatarId: 'avatar_id',
  userId: 'user_id',
  message: 'Hello!'
});

// Listen for messages
socket.on('message', (data) => {
  console.log('New message:', data);
});

// Send audio
socket.emit('message', {
  sessionId: 'session_id',
  content: audioData,
  type: 'audio'
});
```

## 🎯 Use Cases

### 🧑‍🏫 Education & Training
- **Virtual teachers** - Personalized learning experiences
- **Training simulations** - Realistic practice scenarios
- **Language learning** - Interactive conversation practice

### 🧑‍💼 Customer Support
- **24/7 support agents** - Always-available assistance
- **Product demonstrations** - Interactive product tours
- **FAQ automation** - Natural question answering

### 🏦 Banking & Finance
- **Onboarding assistants** - Guided account setup
- **Financial advisors** - Personalized financial guidance
- **Compliance training** - Regulatory education

### 🛍️ Sales & Marketing
- **Product explainers** - Interactive product presentations
- **Lead qualification** - Automated customer engagement
- **Brand ambassadors** - Consistent brand representation

### 🎥 Content Creation
- **Video production** - Automated content generation
- **Social media** - Engaging avatar content
- **Live streaming** - Interactive avatar hosts

## 💰 Monetization Model

### Free Tier
- 1 avatar creation
- 100 conversation minutes/month
- Basic video generation (720p)
- Community support

### Pro Plan ($29/month)
- 5 avatars
- 500 conversation minutes/month
- HD video generation (1080p)
- Priority support
- API access

### Enterprise (Custom)
- Unlimited avatars
- Unlimited conversation minutes
- 4K video generation
- On-premise deployment
- Dedicated support
- Custom integrations

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="file:./db/custom.db"

# AI Services (configured via z-ai-web-dev-sdk)
AI_SERVICE_URL="https://api.z.ai"
AI_API_KEY="your_api_key"

# Services
AVATAR_CHAT_PORT=3001
VIDEO_GENERATOR_PORT=3002

# Security
JWT_SECRET="your_jwt_secret"
ENCRYPTION_KEY="your_encryption_key"
```

### Database Schema
The platform uses SQLite with the following main models:
- **Users** - User accounts and billing
- **Avatars** - Avatar configurations and models
- **Sessions** - Conversation sessions
- **Messages** - Chat messages and metadata
- **Videos** - Generated videos and processing status
- **ApiKeys** - API authentication and rate limiting

## 🚀 Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose up -d

# Scale services
docker-compose up -d --scale avatar-chat=3 --scale video-generator=2
```

### Cloud Deployment
- **Vercel** - Frontend and API routes
- **Railway/Render** - Backend services
- **AWS/GCP** - Scalable infrastructure
- **Cloudflare** - CDN and security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [docs.talkavatar.com](https://docs.talkavatar.com)
- **Community**: [discord.gg/talkavatar](https://discord.gg/talkavatar)
- **Email**: support@talkavatar.com
- **Status**: [status.talkavatar.com](https://status.talkavatar.com)

---

**TalkAvatar** - Where AI avatars come to life 🚀