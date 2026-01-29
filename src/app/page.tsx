'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mic, MicOff, Video, Upload, Play, Pause, Settings, Users, MessageSquare, Film, Brain, Camera, Key, BarChart3, Shield, Cloud, Star, Plus, Edit, Trash2, Eye, Download } from 'lucide-react'

interface AvatarData {
  id: string
  name: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  voiceId?: string
  language: string
  gender?: string
  ageRange?: string
  personality?: string
  role?: string
  isActive: boolean
  isPublic: boolean
  trainingStatus: string
  accuracy?: number
  createdAt: string
}

interface SessionData {
  id: string
  sessionId: string
  avatarId: string
  status: string
  startTime: string
  endTime?: string
  duration?: number
  messageCount: number
  totalCost: number
  language: string
}

interface VideoData {
  id: string
  title: string
  script: string
  avatarId: string
  status: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  resolution?: string
  progress: number
  createdAt: string
}

export default function TalkAvatarDashboard() {
  const [activeTab, setActiveTab] = useState('avatars')
  
  // Mock data for demonstration
  const mockAvatars: AvatarData[] = [
    {
      id: '1',
      name: 'Sarah - Customer Support',
      description: 'Friendly and professional customer service avatar',
      imageUrl: '/api/placeholder/200/200',
      language: 'en',
      gender: 'female',
      ageRange: 'adult',
      personality: 'friendly',
      role: 'support',
      isActive: true,
      isPublic: false,
      trainingStatus: 'ready',
      accuracy: 0.95,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Professor Chen - Math Tutor',
      description: 'Expert mathematics teacher for students',
      imageUrl: '/api/placeholder/200/200',
      language: 'en',
      gender: 'male',
      ageRange: 'adult',
      personality: 'professional',
      role: 'teacher',
      isActive: true,
      isPublic: true,
      trainingStatus: 'ready',
      accuracy: 0.92,
      createdAt: '2024-01-10T15:30:00Z'
    }
  ]

  const mockSessions: SessionData[] = [
    {
      id: '1',
      sessionId: 'sess_123',
      avatarId: '1',
      status: 'active',
      startTime: '2024-01-20T14:00:00Z',
      messageCount: 12,
      totalCost: 0.24,
      language: 'en'
    }
  ]

  const mockVideos: VideoData[] = [
    {
      id: '1',
      title: 'Welcome to Our Platform',
      script: 'Welcome to TalkAvatar, the revolutionary platform for creating AI-powered talking avatars...',
      avatarId: '1',
      status: 'ready',
      videoUrl: '/api/placeholder/640/360',
      thumbnailUrl: '/api/placeholder/320/180',
      duration: 120,
      resolution: '1080p',
      progress: 100,
      createdAt: '2024-01-18T09:00:00Z'
    }
  ]

  const [avatars, setAvatars] = useState<AvatarData[]>(mockAvatars)
  const [sessions, setSessions] = useState<SessionData[]>(mockSessions)
  const [videos, setVideos] = useState<VideoData[]>(mockVideos)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarData | null>(null)
  const [conversation, setConversation] = useState<Array<{role: string, content: string, timestamp: string}>>([])
  const [messageInput, setMessageInput] = useState('')
  const [showCreateAvatar, setShowCreateAvatar] = useState(false)
  const [showVideoGenerator, setShowVideoGenerator] = useState(false)
  const [videoScript, setVideoScript] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [selectedVideoAvatar, setSelectedVideoAvatar] = useState('')

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedAvatar) {
      const newMessage = {
        role: 'user',
        content: messageInput,
        timestamp: new Date().toISOString()
      }
      setConversation([...conversation, newMessage])
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          role: 'assistant',
          content: `Hello! I'm ${selectedAvatar.name}. How can I help you today?`,
          timestamp: new Date().toISOString()
        }
        setConversation(prev => [...prev, aiResponse])
      }, 1000)
      
      setMessageInput('')
    }
  }

  const handleCreateAvatar = () => {
    const newAvatar: AvatarData = {
      id: Date.now().toString(),
      name: 'New Avatar',
      description: 'Custom avatar description',
      language: 'en',
      isActive: true,
      isPublic: false,
      trainingStatus: 'pending',
      createdAt: new Date().toISOString()
    }
    setAvatars([...avatars, newAvatar])
    setShowCreateAvatar(false)
  }

  const handleGenerateVideo = () => {
    if (videoTitle && videoScript && selectedVideoAvatar) {
      const newVideo: VideoData = {
        id: Date.now().toString(),
        title: videoTitle,
        script: videoScript,
        avatarId: selectedVideoAvatar,
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString()
      }
      setVideos([...videos, newVideo])
      
      // Simulate video generation progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setVideos(prev => prev.map(v => 
          v.id === newVideo.id ? { ...v, progress } : v
        ))
        if (progress >= 100) {
          clearInterval(interval)
          setVideos(prev => prev.map(v => 
            v.id === newVideo.id ? { 
              ...v, 
              status: 'ready', 
              videoUrl: '/api/placeholder/640/360',
              thumbnailUrl: '/api/placeholder/320/180',
              duration: 90,
              resolution: '1080p'
            } : v
          ))
        }
      }, 500)
      
      setShowVideoGenerator(false)
      setVideoTitle('')
      setVideoScript('')
      setSelectedVideoAvatar('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                🧠 TalkAvatar
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Real-Time AI Talking Avatars Platform
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Pro Plan
              </Badge>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="avatars" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Avatars Tab */}
          <TabsContent value="avatars" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Avatars</h2>
              <Dialog open={showCreateAvatar} onOpenChange={setShowCreateAvatar}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Avatar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Avatar</DialogTitle>
                    <DialogDescription>
                      Upload a photo or video to create your AI avatar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="avatar-name">Avatar Name</Label>
                      <Input id="avatar-name" placeholder="Enter avatar name" />
                    </div>
                    <div>
                      <Label htmlFor="avatar-description">Description</Label>
                      <Textarea id="avatar-description" placeholder="Describe your avatar's personality and role" />
                    </div>
                    <div>
                      <Label htmlFor="avatar-upload">Upload Photo/Video</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG, MP4 up to 100MB</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="avatar-gender">Gender</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="avatar-age">Age Range</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="young">Young</SelectItem>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleCreateAvatar} className="w-full">
                      Create Avatar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {avatars.map((avatar) => (
                <Card key={avatar.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                        <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{avatar.name}</CardTitle>
                    <CardDescription>{avatar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge variant={avatar.trainingStatus === 'ready' ? 'default' : 'secondary'}>
                          {avatar.trainingStatus}
                        </Badge>
                      </div>
                      {avatar.accuracy && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Accuracy</span>
                          <span className="text-sm font-medium">{(avatar.accuracy * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Language</span>
                        <span className="text-sm">{avatar.language.toUpperCase()}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedAvatar(avatar)
                            setActiveTab('conversation')
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Conversation Tab */}
          <TabsContent value="conversation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Avatar Conversation</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select value={selectedAvatar?.id || ''} onValueChange={(value) => {
                          const avatar = avatars.find(a => a.id === value)
                          setSelectedAvatar(avatar || null)
                        }}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select avatar" />
                          </SelectTrigger>
                          <SelectContent>
                            {avatars.map((avatar) => (
                              <SelectItem key={avatar.id} value={avatar.id}>
                                {avatar.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => setIsRecording(!isRecording)}
                        >
                          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {conversation.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Session Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Duration</span>
                        <span className="text-sm">2:34</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Messages</span>
                        <span className="text-sm">{conversation.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Cost</span>
                        <span className="text-sm">$0.05</span>
                      </div>
                      <div className="pt-4 space-y-2">
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Export Chat
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Videos</h2>
              <Dialog open={showVideoGenerator} onOpenChange={setShowVideoGenerator}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generate Avatar Video</DialogTitle>
                    <DialogDescription>
                      Create a video with your talking avatar from text script
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="video-title">Video Title</Label>
                      <Input 
                        id="video-title" 
                        placeholder="Enter video title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-script">Script</Label>
                      <Textarea 
                        id="video-script" 
                        placeholder="Enter the script for your avatar to speak..."
                        rows={6}
                        value={videoScript}
                        onChange={(e) => setVideoScript(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-avatar">Select Avatar</Label>
                      <Select value={selectedVideoAvatar} onValueChange={setSelectedVideoAvatar}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an avatar" />
                        </SelectTrigger>
                        <SelectContent>
                          {avatars.map((avatar) => (
                            <SelectItem key={avatar.id} value={avatar.id}>
                              {avatar.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="video-resolution">Resolution</Label>
                        <Select defaultValue="1080p">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="4k">4K</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="video-background">Background</Label>
                        <Select defaultValue="solid">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid Color</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleGenerateVideo} className="w-full">
                      <Film className="w-4 h-4 mr-2" />
                      Generate Video
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative">
                      {video.thumbnailUrl ? (
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {video.status === 'processing' && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm">Processing... {video.progress}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.script.substring(0, 100)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {video.status === 'processing' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-500">Progress</span>
                            <span className="text-sm">{video.progress}%</span>
                          </div>
                          <Progress value={video.progress} />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Duration</span>
                            <span className="text-sm">{video.duration}s</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Resolution</span>
                            <span className="text-sm">{video.resolution}</span>
                          </div>
                        </>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" disabled={video.status !== 'ready'}>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm" disabled={video.status !== 'ready'}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Avatars</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avatars.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos Generated</CardTitle>
                  <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +5 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45.23</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="w-12 h-12" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avatar Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {avatars.map((avatar) => (
                      <div key={avatar.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={avatar.imageUrl} alt={avatar.name} />
                            <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{avatar.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {avatar.accuracy ? `${(avatar.accuracy * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="default-language">Default Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="voice-settings">Voice Settings</Label>
                      <Select defaultValue="natural">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">Natural</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="expressive">Expressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="video-quality">Default Video Quality</Label>
                      <Select defaultValue="1080p">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p (Faster)</SelectItem>
                          <SelectItem value="1080p">1080p (Balanced)</SelectItem>
                          <SelectItem value="4k">4K (Best Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Data Encryption</Label>
                        <p className="text-sm text-gray-500">Encrypt all avatar and conversation data</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Local Processing</Label>
                        <p className="text-sm text-gray-500">Process sensitive data locally when possible</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Camera Access</Label>
                        <p className="text-sm text-gray-500">Allow avatar to detect user presence and emotions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <Avatar className="w-20 h-20 mx-auto mb-4">
                          <AvatarImage src="/api/placeholder/80/80" alt="User" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-gray-500">john.doe@example.com</p>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Key className="w-4 h-4 mr-2" />
                          Manage API Keys
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Alert>
              <Cloud className="h-4 w-4" />
              <AlertDescription>
                Use our REST API and WebSocket endpoints to integrate TalkAvatar into your applications.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Authentication</h4>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        POST /api/auth/login
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Avatar Management</h4>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        GET /api/avatars<br />
                        POST /api/avatars<br />
                        PUT /api/avatars/:id<br />
                        DELETE /api/avatars/:id
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Conversation</h4>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        POST /api/sessions<br />
                        POST /api/sessions/:id/message<br />
                        GET /api/sessions/:id/messages
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Video Generation</h4>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        POST /api/videos/generate<br />
                        GET /api/videos/:id<br />
                        GET /api/videos/:id/download
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WebSocket Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Real-time Conversation</h4>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        ws://localhost:3000/conversation?XTransformPort=3001
                      </code>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Events</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code>message</code> - New message received</li>
                        <li>• <code>audio</code> - Audio data stream</li>
                        <li>• <code>video</code> - Video data stream</li>
                        <li>• <code>emotion</code> - Emotion detection</li>
                        <li>• <code>status</code> - Session status update</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Example Code</h4>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`const ws = new WebSocket('/conversation?XTransformPort=3001');
ws.send(JSON.stringify({
  type: 'start_session',
  avatarId: 'avatar_123',
  message: 'Hello!'
}));`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Production Key</h4>
                      <p className="text-sm text-gray-500">Full access to all API endpoints</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        tk_live_1234567890abcdef
                      </code>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}