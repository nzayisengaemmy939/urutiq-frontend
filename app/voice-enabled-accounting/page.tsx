"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { 
  Mic, 
  MicOff, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Zap,
  Target,
  Activity,
  BarChart3
} from "lucide-react"

export default function VoiceEnabledAccountingPage() {
  const [activeTab, setActiveTab] = useState('voice-commands')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceCommands, setVoiceCommands] = useState([
    { command: "Create invoice for", example: "Create invoice for John Smith for $500", status: "active" },
    { command: "Record expense", example: "Record expense of $50 for office supplies", status: "active" },
    { command: "Show cash flow", example: "Show cash flow for this month", status: "active" },
    { command: "Generate report", example: "Generate profit and loss report", status: "active" },
    { command: "Add vendor", example: "Add vendor ABC Company", status: "learning" },
    { command: "Reconcile bank", example: "Reconcile bank account", status: "learning" },
  ])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        setTranscript(finalTranscript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setIsProcessing(true)
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false)
      }, 2000)
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Voice-Enabled Accounting</h1>
              <p className="text-muted-foreground">Control your accounting system with voice commands and natural language</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Voice Settings
              </Button>
              <Button onClick={() => speak("Voice accounting system ready")}>
                <Volume2 className="w-4 h-4 mr-2" />
                Test Voice
              </Button>
            </div>
          </div>

          {/* Voice Control Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-y-4 flex-col">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-100 border-4 border-red-500 animate-pulse' 
                    : isProcessing 
                    ? 'bg-blue-100 border-4 border-blue-500' 
                    : 'bg-gray-100 border-4 border-gray-300'
                }`}>
                  {isListening ? (
                    <Mic className="w-16 h-16 text-red-600" />
                  ) : isProcessing ? (
                    <Brain className="w-16 h-16 text-blue-600 animate-spin" />
                  ) : (
                    <MicOff className="w-16 h-16 text-gray-600" />
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to Listen'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isListening 
                      ? 'Speak your accounting command' 
                      : isProcessing 
                      ? 'Analyzing your command...' 
                      : 'Click the microphone to start voice input'
                    }
                  </p>
                  
                  <div className="flex gap-2">
                    {!isListening ? (
                      <Button onClick={startListening} size="lg">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Listening
                      </Button>
                    ) : (
                      <Button onClick={stopListening} variant="destructive" size="lg">
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Listening
                      </Button>
                    )}
                  </div>
                </div>
                
                {transcript && (
                  <div className="w-full max-w-2xl">
                    <h4 className="font-medium mb-2">Transcript:</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm">{transcript}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commands Executed</p>
                    <p className="text-xl font-bold">342</p>
                    <p className="text-xs text-green-600">+28 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    <p className="text-xl font-bold">96.8%</p>
                    <p className="text-xs text-blue-600">+1.2% improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-xl font-bold">23h</p>
                    <p className="text-xs text-purple-600">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Commands</p>
                    <p className="text-xl font-bold">12</p>
                    <p className="text-xs text-amber-600">Voice shortcuts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="voice-commands">Voice Commands</TabsTrigger>
              <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="learning">AI Learning</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="voice-commands" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Available Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {voiceCommands.map((cmd, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{cmd.command}</h4>
                          <Badge 
                            variant="outline" 
                            className={
                              cmd.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }
                          >
                            {cmd.status === 'active' ? 'Active' : 'Learning'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Example: "{cmd.example}"</p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => speak(cmd.example)}
                          >
                            <Volume2 className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent-activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Voice Commands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">"Create invoice for ABC Corp for $1,200"</p>
                        <p className="text-xs text-muted-foreground">Invoice #INV-2024-001 created successfully</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">"Show cash flow for this month"</p>
                        <p className="text-xs text-muted-foreground">Cash flow report generated</p>
                      </div>
                      <span className="text-xs text-muted-foreground">5 min ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">"Record expense of $45 for office supplies"</p>
                        <p className="text-xs text-muted-foreground">Expense recorded and categorized</p>
                      </div>
                      <span className="text-xs text-muted-foreground">12 min ago</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">"Add vendor XYZ Company"</p>
                        <p className="text-xs text-muted-foreground">Command not recognized - learning mode</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Voice Recognition Accuracy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">96.8%</div>
                          <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                          <div className="text-xs text-green-600 mt-1">+1.2% this month</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">342</div>
                          <div className="text-sm text-muted-foreground">Commands Processed</div>
                          <div className="text-xs text-blue-600 mt-1">+28 this week</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">23h</div>
                          <div className="text-sm text-muted-foreground">Time Saved</div>
                          <div className="text-xs text-purple-600 mt-1">This month</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Learning Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">New Command Pattern</p>
                          <p className="text-xs text-blue-700">AI learned to recognize "Add vendor" commands</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900">Accuracy Improvement</p>
                          <p className="text-xs text-green-700">Voice recognition accuracy improved by 1.2% this month</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">Command Expansion</p>
                          <p className="text-xs text-purple-700">Added support for "Generate report" voice command</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Voice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Voice Recognition</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Wake word detection</p>
                            <p className="text-sm text-muted-foreground">Listen for "Hey UrutiIQ" to activate</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Voice feedback</p>
                            <p className="text-sm text-muted-foreground">Audio confirmation of commands</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Continuous listening</p>
                            <p className="text-sm text-muted-foreground">Keep microphone active for multiple commands</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Command Customization</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Custom commands</p>
                            <p className="text-sm text-muted-foreground">Create personalized voice shortcuts</p>
                          </div>
                          <Button variant="outline" size="sm">Add Command</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Command training</p>
                            <p className="text-sm text-muted-foreground">Train AI on your specific voice patterns</p>
                          </div>
                          <Button variant="outline" size="sm">Start Training</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
