"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  PiggyBank, 
  CreditCard,
  Building,
  Users,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  Target
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  example: any
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'basics',
    title: 'What is a Journal Entry?',
    description: 'Understanding the foundation of business record-keeping',
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Think of it like a diary for your business money</h3>
          <p className="text-blue-800 text-sm">
            Every time money moves in or out of your business, you write it down. 
            This helps you track where your money comes from and where it goes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Money Coming In</span>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Customer payments</li>
                <li>• Service income</li>
                <li>• Product sales</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Money Going Out</span>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Rent payments</li>
                <li>• Office supplies</li>
                <li>• Employee salaries</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    example: {
      scenario: "You sold $500 worth of services to a customer",
      explanation: "This brings money into your business, so it's recorded as income"
    }
  },
  {
    id: 'debits-credits',
    title: 'Debits vs Credits (Made Simple)',
    description: 'The two sides of every transaction',
    content: (
      <div className="space-y-4">
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Simple Rule:</strong> Every transaction has two sides - money must come from somewhere and go somewhere else.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Plus className="w-5 h-5" />
                Debit (Left Side)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium text-green-900 mb-1">Think: "Money In" or "Value Added"</p>
                  <p className="text-xs text-green-700">When something valuable comes into your business</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Examples:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Cash received from customer
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Office supplies purchased
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Equipment bought
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Minus className="w-5 h-5" />
                Credit (Right Side)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-sm font-medium text-red-900 mb-1">Think: "Source of Money" or "Where it came from"</p>
                  <p className="text-xs text-red-700">Shows where the money came from to pay for something</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Examples:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-red-600" />
                      Revenue earned from sales
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-red-600" />
                      Cash paid out
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-red-600" />
                      Bank account used
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 mb-1">Golden Rule</p>
                <p className="text-sm text-yellow-800">
                  Total Debits must always equal Total Credits. This keeps your books balanced!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    example: {
      scenario: "You buy $100 of office supplies with cash",
      explanation: "Debit: Office Supplies +$100 (you got something valuable)\nCredit: Cash -$100 (where the money came from)"
    }
  },
  {
    id: 'account-types',
    title: 'Types of Accounts',
    description: 'Different categories where transactions are recorded',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                <PiggyBank className="w-5 h-5" />
                Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 mb-3">Things your business owns</p>
              <ul className="text-sm space-y-1">
                <li>• Cash & Bank accounts</li>
                <li>• Equipment & furniture</li>
                <li>• Inventory & supplies</li>
                <li>• Money owed by customers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700 text-base">
                <CreditCard className="w-5 h-5" />
                Liabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-800 mb-3">Money your business owes</p>
              <ul className="text-sm space-y-1">
                <li>• Business loans</li>
                <li>• Credit card debt</li>
                <li>• Bills to pay</li>
                <li>• Employee salaries owed</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 text-base">
                <Building className="w-5 h-5" />
                Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-800 mb-3">Owner's stake in business</p>
              <ul className="text-sm space-y-1">
                <li>• Initial investment</li>
                <li>• Retained earnings</li>
                <li>• Owner contributions</li>
                <li>• Business profits</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700 text-base">
                <TrendingUp className="w-5 h-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 mb-3">Money earned from business</p>
              <ul className="text-sm space-y-1">
                <li>• Product sales</li>
                <li>• Service income</li>
                <li>• Interest earned</li>
                <li>• Rental income</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                <DollarSign className="w-5 h-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-3">Money spent to run the business</p>
              <div className="grid grid-cols-2 gap-4">
                <ul className="text-sm space-y-1">
                  <li>• Rent & utilities</li>
                  <li>• Employee salaries</li>
                  <li>• Office supplies</li>
                  <li>• Marketing costs</li>
                </ul>
                <ul className="text-sm space-y-1">
                  <li>• Insurance</li>
                  <li>• Professional services</li>
                  <li>• Travel expenses</li>
                  <li>• Equipment maintenance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    example: {
      scenario: "You pay $2,000 monthly rent",
      explanation: "This goes to 'Rent Expense' account because it's money spent to operate your business"
    }
  },
  {
    id: 'common-examples',
    title: 'Common Business Transactions',
    description: 'Real-world examples you\'ll encounter',
    content: (
      <div className="space-y-4">
        {[
          {
            title: "Customer pays for your service",
            icon: <Users className="w-5 h-5 text-green-600" />,
            color: "border-green-200 bg-green-50",
            debit: { account: "Cash", amount: 500, reason: "Money received" },
            credit: { account: "Service Revenue", amount: 500, reason: "Income earned" }
          },
          {
            title: "Buy office supplies with cash",
            icon: <Building className="w-5 h-5 text-blue-600" />,
            color: "border-blue-200 bg-blue-50",
            debit: { account: "Office Supplies", amount: 150, reason: "Got supplies" },
            credit: { account: "Cash", amount: 150, reason: "Paid with cash" }
          },
          {
            title: "Pay monthly rent",
            icon: <Building className="w-5 h-5 text-orange-600" />,
            color: "border-orange-200 bg-orange-50",
            debit: { account: "Rent Expense", amount: 2000, reason: "Business expense" },
            credit: { account: "Cash", amount: 2000, reason: "Payment made" }
          },
          {
            title: "Take out business loan",
            icon: <CreditCard className="w-5 h-5 text-purple-600" />,
            color: "border-purple-200 bg-purple-50",
            debit: { account: "Cash", amount: 10000, reason: "Money received" },
            credit: { account: "Loan Payable", amount: 10000, reason: "Owe this back" }
          }
        ].map((example, idx) => (
          <Card key={idx} className={example.color}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {example.icon}
                {example.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Badge className="mb-2 bg-green-100 text-green-800">Debit</Badge>
                  <div className="space-y-1">
                    <p className="font-medium">{example.debit.account}</p>
                    <p className="text-sm text-muted-foreground">{example.debit.reason}</p>
                    <p className="font-mono text-green-600">+${example.debit.amount}</p>
                  </div>
                </div>
                <div>
                  <Badge className="mb-2 bg-red-100 text-red-800">Credit</Badge>
                  <div className="space-y-1">
                    <p className="font-medium">{example.credit.account}</p>
                    <p className="text-sm text-muted-foreground">{example.credit.reason}</p>
                    <p className="font-mono text-red-600">-${example.credit.amount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    example: {
      scenario: "Practice with these examples",
      explanation: "Try to think through why each account is debited or credited"
    }
  }
]

export function AccountingTutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  
  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const progress = (completedSteps.length / TUTORIAL_STEPS.length) * 100

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Accounting Basics Tutorial
            </CardTitle>
            <CardDescription>
              Learn the fundamentals of journal entries in simple terms
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {completedSteps.length} / {TUTORIAL_STEPS.length} Complete
          </Badge>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={TUTORIAL_STEPS[currentStep].id} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {TUTORIAL_STEPS.map((step, idx) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id}
                onClick={() => setCurrentStep(idx)}
                className="text-xs"
              >
                {completedSteps.includes(step.id) && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {step.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {TUTORIAL_STEPS.map((step, idx) => (
            <TabsContent key={step.id} value={step.id} className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {step.content}

                {step.example && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Example
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{step.example.scenario}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {step.example.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    onClick={() => {
                      markStepComplete(step.id)
                      if (currentStep < TUTORIAL_STEPS.length - 1) {
                        setCurrentStep(currentStep + 1)
                      }
                    }}
                    className="ml-auto"
                  >
                    {currentStep === TUTORIAL_STEPS.length - 1 ? (
                      completedSteps.includes(step.id) ? 'Tutorial Complete!' : 'Complete Tutorial'
                    ) : (
                      <>
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
