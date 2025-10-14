import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { BookOpen, DollarSign, TrendingUp, PiggyBank, CreditCard, Building, Users, Lightbulb, CheckCircle, ArrowRight, Plus, Minus, RotateCcw, Target } from 'lucide-react';
const TUTORIAL_STEPS = [
    {
        id: 'basics',
        title: 'What is a Journal Entry?',
        description: 'Understanding the foundation of business record-keeping',
        content: (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-blue-900 mb-2", children: "Think of it like a diary for your business money" }), _jsx("p", { className: "text-blue-800 text-sm", children: "Every time money moves in or out of your business, you write it down. This helps you track where your money comes from and where it goes." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "font-medium text-green-900", children: "Money Coming In" })] }), _jsxs("ul", { className: "text-sm text-green-800 space-y-1", children: [_jsx("li", { children: "\u2022 Customer payments" }), _jsx("li", { children: "\u2022 Service income" }), _jsx("li", { children: "\u2022 Product sales" })] })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CreditCard, { className: "w-5 h-5 text-red-600" }), _jsx("span", { className: "font-medium text-red-900", children: "Money Going Out" })] }), _jsxs("ul", { className: "text-sm text-red-800 space-y-1", children: [_jsx("li", { children: "\u2022 Rent payments" }), _jsx("li", { children: "\u2022 Office supplies" }), _jsx("li", { children: "\u2022 Employee salaries" })] })] }) })] })] })),
        example: {
            scenario: "You sold $500 worth of services to a customer",
            explanation: "This brings money into your business, so it's recorded as income"
        }
    },
    {
        id: 'debits-credits',
        title: 'Debits vs Credits (Made Simple)',
        description: 'The two sides of every transaction',
        content: (_jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { children: [_jsx(Lightbulb, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Simple Rule:" }), " Every transaction has two sides - money must come from somewhere and go somewhere else."] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Card, { className: "border-green-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-green-700", children: [_jsx(Plus, { className: "w-5 h-5" }), "Debit (Left Side)"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-green-50 p-3 rounded", children: [_jsx("p", { className: "text-sm font-medium text-green-900 mb-1", children: "Think: \"Money In\" or \"Value Added\"" }), _jsx("p", { className: "text-xs text-green-700", children: "When something valuable comes into your business" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Examples:" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-600" }), "Cash received from customer"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-600" }), "Office supplies purchased"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-green-600" }), "Equipment bought"] })] })] })] }) })] }), _jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-red-700", children: [_jsx(Minus, { className: "w-5 h-5" }), "Credit (Right Side)"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "bg-red-50 p-3 rounded", children: [_jsx("p", { className: "text-sm font-medium text-red-900 mb-1", children: "Think: \"Source of Money\" or \"Where it came from\"" }), _jsx("p", { className: "text-xs text-red-700", children: "Shows where the money came from to pay for something" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Examples:" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-red-600" }), "Revenue earned from sales"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-red-600" }), "Cash paid out"] }), _jsxs("li", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3 text-red-600" }), "Bank account used"] })] })] })] }) })] })] }), _jsx(Card, { className: "bg-yellow-50 border-yellow-200", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(RotateCcw, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-yellow-900 mb-1", children: "Golden Rule" }), _jsx("p", { className: "text-sm text-yellow-800", children: "Total Debits must always equal Total Credits. This keeps your books balanced!" })] })] }) }) })] })),
        example: {
            scenario: "You buy $100 of office supplies with cash",
            explanation: "Debit: Office Supplies +$100 (you got something valuable)\nCredit: Cash -$100 (where the money came from)"
        }
    },
    {
        id: 'account-types',
        title: 'Types of Accounts',
        description: 'Different categories where transactions are recorded',
        content: (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-blue-700 text-base", children: [_jsx(PiggyBank, { className: "w-5 h-5" }), "Assets"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-blue-800 mb-3", children: "Things your business owns" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Cash & Bank accounts" }), _jsx("li", { children: "\u2022 Equipment & furniture" }), _jsx("li", { children: "\u2022 Inventory & supplies" }), _jsx("li", { children: "\u2022 Money owed by customers" })] })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-red-700 text-base", children: [_jsx(CreditCard, { className: "w-5 h-5" }), "Liabilities"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-red-800 mb-3", children: "Money your business owes" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Business loans" }), _jsx("li", { children: "\u2022 Credit card debt" }), _jsx("li", { children: "\u2022 Bills to pay" }), _jsx("li", { children: "\u2022 Employee salaries owed" })] })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-purple-700 text-base", children: [_jsx(Building, { className: "w-5 h-5" }), "Equity"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-purple-800 mb-3", children: "Owner's stake in business" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Initial investment" }), _jsx("li", { children: "\u2022 Retained earnings" }), _jsx("li", { children: "\u2022 Owner contributions" }), _jsx("li", { children: "\u2022 Business profits" })] })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-green-700 text-base", children: [_jsx(TrendingUp, { className: "w-5 h-5" }), "Revenue"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-green-800 mb-3", children: "Money earned from business" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Product sales" }), _jsx("li", { children: "\u2022 Service income" }), _jsx("li", { children: "\u2022 Interest earned" }), _jsx("li", { children: "\u2022 Rental income" })] })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50 md:col-span-2", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-orange-700 text-base", children: [_jsx(DollarSign, { className: "w-5 h-5" }), "Expenses"] }) }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-sm text-orange-800 mb-3", children: "Money spent to run the business" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Rent & utilities" }), _jsx("li", { children: "\u2022 Employee salaries" }), _jsx("li", { children: "\u2022 Office supplies" }), _jsx("li", { children: "\u2022 Marketing costs" })] }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsx("li", { children: "\u2022 Insurance" }), _jsx("li", { children: "\u2022 Professional services" }), _jsx("li", { children: "\u2022 Travel expenses" }), _jsx("li", { children: "\u2022 Equipment maintenance" })] })] })] })] })] }) })),
        example: {
            scenario: "You pay $2,000 monthly rent",
            explanation: "This goes to 'Rent Expense' account because it's money spent to operate your business"
        }
    },
    {
        id: 'common-examples',
        title: 'Common Business Transactions',
        description: 'Real-world examples you\'ll encounter',
        content: (_jsx("div", { className: "space-y-4", children: [
                {
                    title: "Customer pays for your service",
                    icon: _jsx(Users, { className: "w-5 h-5 text-green-600" }),
                    color: "border-green-200 bg-green-50",
                    debit: { account: "Cash", amount: 500, reason: "Money received" },
                    credit: { account: "Service Revenue", amount: 500, reason: "Income earned" }
                },
                {
                    title: "Buy office supplies with cash",
                    icon: _jsx(Building, { className: "w-5 h-5 text-blue-600" }),
                    color: "border-blue-200 bg-blue-50",
                    debit: { account: "Office Supplies", amount: 150, reason: "Got supplies" },
                    credit: { account: "Cash", amount: 150, reason: "Paid with cash" }
                },
                {
                    title: "Pay monthly rent",
                    icon: _jsx(Building, { className: "w-5 h-5 text-orange-600" }),
                    color: "border-orange-200 bg-orange-50",
                    debit: { account: "Rent Expense", amount: 2000, reason: "Business expense" },
                    credit: { account: "Cash", amount: 2000, reason: "Payment made" }
                },
                {
                    title: "Take out business loan",
                    icon: _jsx(CreditCard, { className: "w-5 h-5 text-purple-600" }),
                    color: "border-purple-200 bg-purple-50",
                    debit: { account: "Cash", amount: 10000, reason: "Money received" },
                    credit: { account: "Loan Payable", amount: 10000, reason: "Owe this back" }
                }
            ].map((example, idx) => (_jsxs(Card, { className: example.color, children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [example.icon, example.title] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Badge, { className: "mb-2 bg-green-100 text-green-800", children: "Debit" }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-medium", children: example.debit.account }), _jsx("p", { className: "text-sm text-muted-foreground", children: example.debit.reason }), _jsxs("p", { className: "font-mono text-green-600", children: ["+$", example.debit.amount] })] })] }), _jsxs("div", { children: [_jsx(Badge, { className: "mb-2 bg-red-100 text-red-800", children: "Credit" }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-medium", children: example.credit.account }), _jsx("p", { className: "text-sm text-muted-foreground", children: example.credit.reason }), _jsxs("p", { className: "font-mono text-red-600", children: ["-$", example.credit.amount] })] })] })] }) })] }, idx))) })),
        example: {
            scenario: "Practice with these examples",
            explanation: "Try to think through why each account is debited or credited"
        }
    }
];
export function AccountingTutorial() {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const markStepComplete = (stepId) => {
        if (!completedSteps.includes(stepId)) {
            setCompletedSteps([...completedSteps, stepId]);
        }
    };
    const progress = (completedSteps.length / TUTORIAL_STEPS.length) * 100;
    return (_jsxs(Card, { className: "max-w-4xl mx-auto", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-6 h-6" }), "Accounting Basics Tutorial"] }), _jsx(CardDescription, { children: "Learn the fundamentals of journal entries in simple terms" })] }), _jsxs(Badge, { variant: "secondary", children: [completedSteps.length, " / ", TUTORIAL_STEPS.length, " Complete"] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Progress" }), _jsxs("span", { className: "text-sm font-medium", children: [Math.round(progress), "%"] })] }), _jsx(Progress, { value: progress, className: "h-2" })] })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: TUTORIAL_STEPS[currentStep].id, className: "w-full", children: [_jsx(TabsList, { className: "grid w-full grid-cols-4", children: TUTORIAL_STEPS.map((step, idx) => (_jsxs(TabsTrigger, { value: step.id, onClick: () => setCurrentStep(idx), className: "text-xs", children: [completedSteps.includes(step.id) && (_jsx(CheckCircle, { className: "w-3 h-3 mr-1" })), step.title.split(' ')[0]] }, step.id))) }), TUTORIAL_STEPS.map((step, idx) => (_jsx(TabsContent, { value: step.id, className: "mt-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: step.title }), _jsx("p", { className: "text-muted-foreground", children: step.description })] }), step.content, step.example && (_jsxs(Card, { className: "bg-muted/50", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Example"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "font-medium", children: step.example.scenario }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-line", children: step.example.explanation })] }) })] })), _jsxs("div", { className: "flex justify-between items-center pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentStep(Math.max(0, currentStep - 1)), disabled: currentStep === 0, children: "Previous" }), _jsx(Button, { onClick: () => {
                                                    markStepComplete(step.id);
                                                    if (currentStep < TUTORIAL_STEPS.length - 1) {
                                                        setCurrentStep(currentStep + 1);
                                                    }
                                                }, className: "ml-auto", children: currentStep === TUTORIAL_STEPS.length - 1 ? (completedSteps.includes(step.id) ? 'Tutorial Complete!' : 'Complete Tutorial') : (_jsxs(_Fragment, { children: ["Next ", _jsx(ArrowRight, { className: "w-4 h-4 ml-1" })] })) })] })] }) }, step.id)))] }) })] }));
}
