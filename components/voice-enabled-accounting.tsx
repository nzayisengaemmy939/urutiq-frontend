import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  History,
  BarChart3,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Zap,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Headphones,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Target
} from 'lucide-react';

// Types
interface VoiceSettings {
  id: string;
  companyId: string;
  userId: string;
  isEnabled: boolean;
  language: string;
  voiceSpeed: number;
  voiceType: 'male' | 'female' | 'neutral';
  wakeWord: string;
  autoTranscribe: boolean;
  noiseReduction: boolean;
  commands: VoiceCommandConfig[];
  metadata?: any;
}

interface VoiceCommandConfig {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  action: string;
  parameters: string[];
  isActive: boolean;
  priority: number;
}

interface VoiceCommand {
  id: string;
  companyId: string;
  userId: string;
  audioUrl?: string;
  transcription: string;
  commandType: 'transaction' | 'query' | 'report' | 'navigation' | 'help';
  confidence: number;
  processed: boolean;
  result?: any;
  metadata?: any;
  createdAt: Date;
}

interface VoiceSession {
  id: string;
  companyId: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  commands: VoiceCommand[];
  language: string;
  status: 'active' | 'paused' | 'ended';
  metadata?: any;
}

interface VoiceProcessingResult {
  success: boolean;
  command: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  response: string;
  audioResponse?: string;
}

interface VoiceAnalytics {
  totalCommands: number;
  successfulCommands: number;
  averageConfidence: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
  sessionDuration: number;
  languageUsage: Record<string, number>;
  errorRate: number;
}

// API Functions
const api = {
  getSettings: async (companyId: string, userId: string) => {
    const response = await fetch(`/api/voice/settings/${companyId}/${userId}`);
    return response.json();
  },

  updateSettings: async (companyId: string, userId: string, updates: Partial<VoiceSettings>) => {
    const response = await fetch(`/api/voice/settings/${companyId}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  startSession: async (companyId: string, userId: string, language?: string) => {
    const response = await fetch(`/api/voice/session/${companyId}/${userId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language })
    });
    return response.json();
  },

  endSession: async (sessionId: string) => {
    const response = await fetch(`/api/voice/session/${sessionId}/end`, {
      method: 'PUT'
    });
    return response.json();
  },

  processCommand: async (companyId: string, userId: string, audioData: string, sessionId?: string) => {
    const response = await fetch(`/api/voice/command/${companyId}/${userId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioData, sessionId })
    });
    return response.json();
  },

  getCommandHistory: async (companyId: string, userId: string, limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/voice/commands/${companyId}/${userId}?${params}`);
    return response.json();
  },

  getAnalytics: async (companyId: string, userId: string, periodDays?: number) => {
    const params = new URLSearchParams();
    if (periodDays) params.append('periodDays', periodDays.toString());

    const response = await fetch(`/api/voice/analytics/${companyId}/${userId}?${params}`);
    return response.json();
  },

  getTemplates: async (companyId: string) => {
    const response = await fetch(`/api/voice/templates/${companyId}`);
    return response.json();
  },

  getLanguages: async () => {
    const response = await fetch('/api/voice/languages');
    return response.json();
  },

  testWakeWord: async (companyId: string, userId: string, wakeWord: string) => {
    const response = await fetch(`/api/voice/wake-word/${companyId}/${userId}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wakeWord })
    });
    return response.json();
  },

  getPerformance: async (companyId: string, userId: string, periodDays?: number) => {
    const params = new URLSearchParams();
    if (periodDays) params.append('periodDays', periodDays.toString());

    const response = await fetch(`/api/voice/performance/${companyId}/${userId}?${params}`);
    return response.json();
  },

  getSuggestions: async (companyId: string, userId: string, context?: string) => {
    const params = new URLSearchParams();
    if (context) params.append('context', context);

    const response = await fetch(`/api/voice/suggestions/${companyId}/${userId}?${params}`);
    return response.json();
  }
};

// Voice-Enabled Accounting Component
export const VoiceEnabledAccounting: React.FC<{ companyId: string; userId: string }> = ({ 
  companyId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'settings' | 'history' | 'analytics'>('voice');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceProcessingResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['voiceSettings', companyId, userId],
    queryFn: () => api.getSettings(companyId, userId),
    enabled: activeTab === 'settings'
  });

  const { data: commandHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['voiceCommandHistory', companyId, userId],
    queryFn: () => api.getCommandHistory(companyId, userId, 50),
    enabled: activeTab === 'history'
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['voiceAnalytics', companyId, userId, selectedPeriod],
    queryFn: () => api.getAnalytics(companyId, userId, selectedPeriod),
    enabled: activeTab === 'analytics'
  });

  const { data: templates } = useQuery({
    queryKey: ['voiceTemplates', companyId],
    queryFn: () => api.getTemplates(companyId)
  });

  const { data: languages } = useQuery({
    queryKey: ['voiceLanguages'],
    queryFn: () => api.getLanguages()
  });

  const { data: performance } = useQuery({
    queryKey: ['voicePerformance', companyId, userId, selectedPeriod],
    queryFn: () => api.getPerformance(companyId, userId, selectedPeriod)
  });

  const { data: suggestions } = useQuery({
    queryKey: ['voiceSuggestions', companyId, userId],
    queryFn: () => api.getSuggestions(companyId, userId)
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: ({ updates }: { updates: Partial<VoiceSettings> }) => 
      api.updateSettings(companyId, userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceSettings', companyId, userId] });
    }
  });

  const startSessionMutation = useMutation({
    mutationFn: ({ language }: { language?: string }) => 
      api.startSession(companyId, userId, language),
    onSuccess: (data) => {
      setCurrentSession(data.data);
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) => 
      api.endSession(sessionId),
    onSuccess: () => {
      setCurrentSession(null);
      queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] });
    }
  });

  const processCommandMutation = useMutation({
    mutationFn: ({ audioData, sessionId }: { audioData: string; sessionId?: string }) => 
      api.processCommand(companyId, userId, audioData, sessionId),
    onSuccess: (data) => {
      setLastCommand(data.data);
      queryClient.invalidateQueries({ queryKey: ['voiceCommandHistory', companyId, userId] });
      queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] });
    }
  });

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const audioData = base64Audio.split(',')[1]; // Remove data URL prefix
          
          setIsProcessing(true);
          await processCommandMutation.mutateAsync({ 
            audioData, 
            sessionId: currentSession?.sessionId 
          });
          setIsProcessing(false);
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      
      // Start session if not already started
      if (!currentSession) {
        await startSessionMutation.mutateAsync({ 
          language: settings?.data?.language 
        });
      }

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSettingsUpdate = (updates: Partial<VoiceSettings>) => {
    updateSettingsMutation.mutate({ updates });
  };

  const playAudioResponse = (audioResponse: string) => {
    if (isMuted) return;

    const audio = new Audio(audioResponse);
    audio.play().catch(error => {
      console.error('Error playing audio response:', error);
    });
  };

  // Auto-play audio response when received
  useEffect(() => {
    if (lastCommand?.audioResponse && !isMuted) {
      playAudioResponse(lastCommand.audioResponse);
    }
  }, [lastCommand, isMuted]);

  // Tab Navigation
  const tabs = [
    { id: 'voice', label: 'Voice Commands', icon: Mic },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Voice-Enabled Accounting
              </h1>
              <p className="text-gray-600 mt-1">
                Hands-free accounting with natural language commands
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Headphones className="w-4 h-4" />
                <span>Voice Interface</span>
              </div>
              {settings?.data?.isEnabled && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Commands Tab */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            {/* Voice Interface */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Voice Commands
                </h2>
                <p className="text-gray-600 mb-8">
                  Use natural language to interact with your accounting system
                </p>

                {/* Voice Controls */}
                <div className="flex items-center justify-center space-x-6 mb-8">
                  <button
                    onClick={isListening ? stopRecording : startRecording}
                    disabled={isProcessing || !settings?.data?.isEnabled}
                    className={`flex items-center justify-center w-20 h-20 rounded-full text-white font-semibold text-lg transition-all duration-200 ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-teal-500 hover:bg-teal-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      isMuted ? 'bg-gray-300 text-gray-600' : 'bg-blue-500 text-white'
                    } hover:opacity-80 transition-all duration-200`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {isListening ? 'Listening...' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {isProcessing ? 'Processing...' : 'Idle'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentSession ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {currentSession ? 'Session Active' : 'No Session'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 inline mr-2" />
                    Command Templates
                  </button>
                  <button
                    onClick={() => setShowSuggestions(true)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 inline mr-2" />
                    Suggestions
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Last Command Result */}
            {lastCommand && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Command</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Command:</span>
                    <span className="text-sm font-medium">{lastCommand.command}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Action:</span>
                    <span className="text-sm font-medium">{lastCommand.action}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Confidence:</span>
                    <span className="text-sm font-medium">
                      {Math.round(lastCommand.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Response:</span>
                    <span className="text-sm font-medium">{lastCommand.response}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`text-sm font-medium ${
                      lastCommand.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lastCommand.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Command Examples */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Command Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Transactions</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• "Add transaction for office supplies fifty dollars"</li>
                    <li>• "Record expense for lunch twenty five dollars"</li>
                    <li>• "New transaction for utilities one hundred dollars"</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Queries</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• "What is the balance of checking account"</li>
                    <li>• "Check balance for savings account"</li>
                    <li>• "Show me the balance of credit card"</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Reports</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• "Generate profit and loss report for this month"</li>
                    <li>• "Create cash flow report for last quarter"</li>
                    <li>• "Show me the balance sheet for this year"</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Help</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• "Help"</li>
                    <li>• "What can you do"</li>
                    <li>• "Show available commands"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Voice Settings</h2>
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Settings
                </button>
              </div>

              {settingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading settings...</p>
                </div>
              ) : settings?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">General Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Voice Enabled</span>
                        <span className={`text-sm font-medium ${
                          settings.data.isEnabled ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {settings.data.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Language</span>
                        <span className="text-sm font-medium">{settings.data.language}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Voice Speed</span>
                        <span className="text-sm font-medium">{settings.data.voiceSpeed}x</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Voice Type</span>
                        <span className="text-sm font-medium capitalize">{settings.data.voiceType}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Advanced Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Wake Word</span>
                        <span className="text-sm font-medium">{settings.data.wakeWord}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Auto Transcribe</span>
                        <span className={`text-sm font-medium ${
                          settings.data.autoTranscribe ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {settings.data.autoTranscribe ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Noise Reduction</span>
                        <span className={`text-sm font-medium ${
                          settings.data.noiseReduction ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {settings.data.noiseReduction ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mic className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No settings found</p>
                </div>
              )}
            </div>

            {/* Voice Commands Configuration */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Voice Commands</h3>
              </div>
              <div className="p-6">
                {settings?.data?.commands?.length > 0 ? (
                  <div className="space-y-4">
                    {settings.data.commands.map((command) => (
                      <div key={command.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{command.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              command.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {command.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Priority {command.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{command.description}</p>
                        <div className="text-xs text-gray-500">
                          <div>Action: {command.action}</div>
                          <div>Parameters: {command.parameters.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No voice commands configured</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Voice Command History</h2>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['voiceCommandHistory', companyId, userId] })}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading history...</p>
                </div>
              ) : commandHistory?.data?.length > 0 ? (
                <div className="space-y-4">
                  {commandHistory.data.map((command: VoiceCommand) => (
                    <div key={command.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{command.transcription}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            command.processed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {command.processed ? 'Processed' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Math.round(command.confidence * 100)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(command.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Type: {command.commandType}</div>
                        {command.result && (
                          <div>Result: {JSON.stringify(command.result)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No voice commands in history</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Voice Analytics</h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['voiceAnalytics', companyId, userId] })}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh
                  </button>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
                </div>
              ) : analytics?.data ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mic className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Commands</p>
                      <p className="text-lg font-bold text-gray-900">{analytics.data.totalCommands}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Success Rate</p>
                      <p className="text-lg font-bold text-gray-900">
                        {analytics.data.totalCommands > 0 
                          ? Math.round((analytics.data.successfulCommands / analytics.data.totalCommands) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(analytics.data.averageConfidence * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Session Time</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(analytics.data.sessionDuration)} min
                      </p>
                    </div>
                  </div>
                </div>

                {/* Most Used Commands */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Most Used Commands</h3>
                  <div className="space-y-2">
                    {analytics.data.mostUsedCommands.map((cmd, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{cmd.command}</span>
                        <span className="text-sm text-gray-600">{cmd.count} times</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language Usage */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Language Usage</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics.data.languageUsage).map(([lang, count]) => (
                      <div key={lang} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{lang}</span>
                        <span className="text-sm text-gray-600">{count} sessions</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No analytics data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
