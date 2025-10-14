'use client'

import React, { useState } from 'react'
import { PageLayout } from '@/components/page-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuickJournalEntry } from '@/components/quick-journal-entry'
import { AccountingTutorial } from '@/components/accounting-tutorial'
import { 
  BookOpen, 
  Zap, 
  Calculator, 
  HelpCircle,
  ArrowRight,
  Users,
  Lightbulb,
  Target
} from 'lucide-react'

export default function JournalHelpPage() {
  const [activeTab, setActiveTab] = useState('quick')

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Journal Entry Made Simple</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional journal entries without needing an accounting degree. 
            We'll guide you through every step.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Quick Entry</h3>
              <p className="text-sm text-muted-foreground">
                Pre-built templates for common business transactions
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Learn as You Go</h3>
              <p className="text-sm text-muted-foreground">
                Interactive tutorial explains accounting concepts in plain English
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Auto-Balance</h3>
              <p className="text-sm text-muted-foreground">
                Built-in validation ensures your entries are always balanced
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quick" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Entry
                </TabsTrigger>
                <TabsTrigger value="tutorial" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Learn Basics
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Advanced Entry
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="quick" className="mt-0">
                <QuickJournalEntry />
              </TabsContent>
              
              <TabsContent value="tutorial" className="mt-0">
                <AccountingTutorial />
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-0">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <Calculator className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Full Journal Entry Form</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Access the complete journal entry form with all features including 
                    account selection, validation, and preview options.
                  </p>
                  <Button size="lg" asChild>
                    <a href="/journal/new">
                      Create Full Entry <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                For Non-Accountants
              </CardTitle>
              <CardDescription>
                Don't worry if you're not familiar with accounting terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Plain English Explanations</p>
                  <p className="text-sm text-muted-foreground">
                    We explain debits, credits, and accounts in simple terms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Real-World Examples</p>
                  <p className="text-sm text-muted-foreground">
                    See how common business transactions are recorded
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Step-by-Step Guidance</p>
                  <p className="text-sm text-muted-foreground">
                    We guide you through each field and explain what to enter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Resources
              </CardTitle>
              <CardDescription>
                Additional help to master journal entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Interactive Tutorial
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calculator className="w-4 h-4 mr-2" />
                Common Transaction Examples
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="w-4 h-4 mr-2" />
                Accounting Terms Glossary
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
