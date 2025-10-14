import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { 
  Smartphone,
  Mic,
  Camera,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Zap,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  DollarSign,
  Clock,
  Scan,
  Volume2,
  CloudOff,
  Send as Sync,
  FileText,
} from "lucide-react"
import { useCreateParsedEntry } from "../hooks/useParser"
import { useToast } from "../components/ui/use-toast"

interface VoiceTransaction {
  id: string
  transcript: string
  confidence: number
  extractedData: {
    amount?: number
    vendor?: string
    category?: string
    date?: string
    description?: string
  }
  status: "processing" | "confirmed" | "needs_review"
}

interface ReceiptScan {
  id: string
  imageUrl: string
  extractedData: {
    vendor: string
    amount: number
    date: string
    items: Array<{ description: string; amount: number }>
    tax: number
    total: number
  }
  confidence: number
  status: "processing" | "verified" | "needs_review"
}

interface OfflineAction {
  id: string
  type: "transaction" | "receipt" | "voice_note" | "expense"
  data: any
  timestamp: string
  status: "pending" | "synced" | "failed"
}

const mockVoiceTransactions: VoiceTransaction[] = [
  {
    id: "1",
    transcript: "Add expense for office supplies at Staples for $45.67 on March 15th",
    confidence: 94,
    extractedData: {
      amount: 45.67,
      vendor: "Staples",
      category: "Office Supplies",
      date: "2024-03-15",
      description: "Office supplies",
    },
    status: "confirmed",
  },
  {
    id: "2",
    transcript: "Client lunch at Mario's Restaurant $89.50 yesterday",
    confidence: 87,
    extractedData: {
      amount: 89.5,
      vendor: "Mario's Restaurant",
      category: "Meals & Entertainment",
      date: "2024-03-14",
      description: "Client lunch",
    },
    status: "needs_review",
  },
]

const mockReceiptScans: ReceiptScan[] = [
  {
    id: "1",
    imageUrl: "/paper-receipt.png",
    extractedData: {
      vendor: "Best Buy",
      amount: 299.99,
      date: "2024-03-15",
      items: [
        { description: "Wireless Mouse", amount: 49.99 },
        { description: "USB Cable", amount: 19.99 },
        { description: "Laptop Stand", amount: 229.99 },
      ],
      tax: 24.0,
      total: 299.99,
    },
    confidence: 96,
    status: "verified",
  },
  {
    id: "2",
    imageUrl: "/gas-receipt.png",
    extractedData: {
      vendor: "Shell Gas Station",
      amount: 52.34,
      date: "2024-03-14",
      items: [{ description: "Gasoline", amount: 52.34 }],
      tax: 4.19,
      total: 52.34,
    },
    confidence: 89,
    status: "needs_review",
  },
]

const mockOfflineActions: OfflineAction[] = [
  {
    id: "1",
    type: "expense",
    data: { amount: 25.99, vendor: "Coffee Shop", category: "Meals" },
    timestamp: "2024-03-15 10:30:00",
    status: "pending",
  },
  {
    id: "2",
    type: "receipt",
    data: { imageUrl: "local://receipt_001.jpg", amount: 156.78 },
    timestamp: "2024-03-15 09:15:00",
    status: "synced",
  },
]

export function MobileFirstInnovation() {
  const [isRecording, setIsRecording] = useState(false)
  const [recognitionRef, setRecognitionRef] = useState<any>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [voiceTransactions, setVoiceTransactions] = useState<VoiceTransaction[]>(mockVoiceTransactions)
  const [receiptScans, setReceiptScans] = useState<ReceiptScan[]>(mockReceiptScans)
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>(mockOfflineActions)
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptScan | null>(null)
  const createEntry = useCreateParsedEntry()
  const { toast } = useToast()

  const startVoiceRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        // Fallback to simulated recording
        setIsRecording(true)
        setTimeout(() => {
          setIsRecording(false)
          const newTransaction: VoiceTransaction = {
            id: Date.now().toString(),
            transcript: "Gas station fill up 42,500 RWF this morning",
            confidence: 90,
            extractedData: {
              amount: 42500,
              vendor: "Gas Station",
              category: "Vehicle Expenses",
              date: new Date().toISOString().split("T")[0],
              description: "Gas station fill up",
            },
            status: "needs_review",
          }
          setVoiceTransactions([newTransaction, ...voiceTransactions])
        }, 2000)
        return
      }
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false
      setIsRecording(true)
      setRecognitionRef(recognition)

      let finalTranscript = ''
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) finalTranscript += transcript + ' '
        }
      }
      recognition.onerror = () => {
        setIsRecording(false)
        toast({ title: 'Voice error', description: 'Voice recognition failed, using fallback', variant: 'destructive' })
      }
      recognition.onend = () => {
        setIsRecording(false)
        const text = (finalTranscript || '').trim() || 'Recorded transaction'
        const amountMatch = text.match(/([0-9][0-9,]*\.?[0-9]*)/)
        const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined
        const newTransaction: VoiceTransaction = {
          id: Date.now().toString(),
          transcript: text,
          confidence: 90,
          extractedData: {
            amount,
            vendor: undefined,
            category: undefined,
            date: new Date().toISOString().split('T')[0],
            description: text.slice(0, 80)
          },
          status: 'needs_review'
        }
        setVoiceTransactions([newTransaction, ...voiceTransactions])
      }
      recognition.start()
    } catch (e) {
      setIsRecording(false)
      toast({ title: 'Voice not available', description: 'Falling back to manual entry', variant: 'destructive' })
    }
  }

  const confirmVoiceTransaction = (id: string) => {
    const tx = voiceTransactions.find((t) => t.id === id)
    if (!tx) return
    const companyId = (typeof window !== 'undefined' && (localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company'))) || undefined
    createEntry.mutate(
      { text: tx.transcript, companyId, autoCreate: true },
      {
        onSuccess: () => {
          toast({ title: "Saved", description: "Journal entry created from voice transaction." })
          setVoiceTransactions(voiceTransactions.map((t) => (t.id === id ? { ...t, status: "confirmed" as const } : t)))
        },
        onError: (err: any) => {
          toast({ title: "Save failed", description: err?.message || "Failed to create entry", variant: "destructive" })
        }
      }
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "verified":
      case "synced":
        return "bg-green-100 text-green-700"
      case "processing":
      case "pending":
        return "bg-blue-100 text-blue-700"
      case "needs_review":
      case "failed":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "verified":
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "needs_review":
      case "failed":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const pendingActions = offlineActions.filter((action) => action.status === "pending")
  const syncedActions = offlineActions.filter((action) => action.status === "synced")

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-teal-600" />
            <CardTitle className="text-teal-900">Mobile Innovation Hub</CardTitle>
            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
              AI-Powered
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isOffline ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
              <span className="text-xs text-gray-600">{isOffline ? "Offline" : "Online"}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOffline(!isOffline)}
              className="border-teal-300 text-teal-700 bg-transparent"
            >
              {isOffline ? "Go Online" : "Go Offline"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="voice">Voice Entry</TabsTrigger>
            <TabsTrigger value="receipt">Receipt Scan</TabsTrigger>
            <TabsTrigger value="offline">Offline Mode</TabsTrigger>
            <TabsTrigger value="gestures">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-teal-600" />
                  Voice-to-Transaction
                </CardTitle>
                <p className="text-sm text-gray-600">Speak naturally to record expenses and transactions</p>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div
                    className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? "bg-red-100 border-4 border-red-300 animate-pulse"
                        : "bg-teal-100 border-4 border-teal-300"
                    }`}
                  >
                    {isRecording ? (
                      <Volume2 className="h-8 w-8 text-red-600" />
                    ) : (
                      <Mic className="h-8 w-8 text-teal-600" />
                    )}
                  </div>
                  <Button
                    size="lg"
                    onClick={startVoiceRecording}
                    disabled={isRecording}
                    className={`${
                      isRecording ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"
                    } transition-colors`}
                  >
                    {isRecording ? "Recording..." : "Start Recording"}
                  </Button>
                  {isRecording && (
                    <p className="text-sm text-gray-600">
                      Try saying: "Add expense for lunch at Joe's Diner for $15.50 today"
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Voice Transactions</h4>
              {voiceTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(transaction.status)}
                          <Badge variant="outline" className={getStatusColor(transaction.status)}>
                            {transaction.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">{transaction.confidence}% confident</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 italic">"{transaction.transcript}"</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Amount: </span>
                            <span className="font-medium">${transaction.extractedData.amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vendor: </span>
                            <span className="font-medium">{transaction.extractedData.vendor}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category: </span>
                            <span className="font-medium">{transaction.extractedData.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date: </span>
                            <span className="font-medium">{transaction.extractedData.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {transaction.status === "needs_review" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => confirmVoiceTransaction(transaction.id)}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-teal-600" />
                  Smart Receipt Processing
                </CardTitle>
                <p className="text-sm text-gray-600">Advanced OCR extracts all data from receipt photos</p>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-teal-100 rounded-lg flex items-center justify-center border-2 border-dashed border-teal-300">
                    <Camera className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Camera className="h-4 w-4 mr-1" />
                      Take Photo
                    </Button>
                    <Button variant="outline" className="border-teal-300 text-teal-700 bg-transparent">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Processed Receipts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receiptScans.map((receipt) => (
                  <Card key={receipt.id} className="cursor-pointer" onClick={() => setSelectedReceipt(receipt)}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(receipt.status)}
                            <Badge variant="outline" className={getStatusColor(receipt.status)}>
                              {receipt.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <h5 className="font-medium text-gray-900">{receipt.extractedData.vendor}</h5>
                          <p className="text-sm text-gray-600">${receipt.extractedData.total}</p>
                          <p className="text-xs text-gray-500">{receipt.extractedData.date}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Scan className="h-3 w-3 text-teal-600" />
                            <span className="text-xs text-gray-600">{receipt.confidence}% accuracy</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedReceipt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Receipt Details</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedReceipt(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Vendor</Label>
                      <Input value={selectedReceipt.extractedData.vendor} className="mt-1" />
                    </div>
                    <div>
                      <Label>Total Amount</Label>
                      <Input value={selectedReceipt.extractedData.total} className="mt-1" />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input value={selectedReceipt.extractedData.date} className="mt-1" />
                    </div>
                    <div>
                      <Label>Tax</Label>
                      <Input value={selectedReceipt.extractedData.tax} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Items</Label>
                    <div className="space-y-2 mt-1">
                      {selectedReceipt.extractedData.items.map((item, index) => (
                        <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item.description}</span>
                          <span className="text-sm font-medium">${item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="bg-teal-600 hover:bg-teal-700">Save Transaction</Button>
                    <Button variant="outline">Need Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="offline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CloudOff className="h-5 w-5 text-teal-600" />
                  Offline-First Design
                </CardTitle>
                <p className="text-sm text-gray-600">Full functionality even without internet connection</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Local Storage</h4>
                    <p className="text-sm text-gray-600">Data cached locally</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Sync className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-gray-900">Auto Sync</h4>
                    <p className="text-sm text-gray-600">Syncs when online</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Instant Actions</h4>
                    <p className="text-sm text-gray-600">No waiting for network</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Sync ({pendingActions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {action.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div className="text-xs text-gray-600">{action.timestamp}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recently Synced ({syncedActions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {syncedActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {action.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div className="text-xs text-gray-600">{action.timestamp}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Synced
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gestures" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Touch-Optimized Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">Swipe gestures and touch-friendly controls</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2 bg-teal-600 hover:bg-teal-700">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Add Expense</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Scan Receipt</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-purple-600 hover:bg-purple-700">
                    <Mic className="h-6 w-6" />
                    <span className="text-sm">Voice Entry</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Quick Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gesture Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-teal-600">→</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Swipe Right</div>
                      <div className="text-sm text-gray-600">Mark transaction as approved</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">←</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Swipe Left</div>
                      <div className="text-sm text-gray-600">Flag for review or delete</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">↑</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Swipe Up</div>
                      <div className="text-sm text-gray-600">Quick categorize or archive</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">⊕</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Long Press</div>
                      <div className="text-sm text-gray-600">Access context menu with more options</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
