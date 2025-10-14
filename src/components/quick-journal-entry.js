import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { DollarSign, Receipt, CreditCard, Building, Coffee, Car, Smartphone, Lightbulb, Plus, ArrowRight } from 'lucide-react';
const QUICK_TRANSACTIONS = [
    {
        id: 'expense_payment',
        title: 'Pay Business Expense',
        description: 'Record money spent on business needs',
        icon: _jsx(Receipt, { className: "w-5 h-5" }),
        color: 'bg-red-50 text-red-600 border-red-200',
        examples: ['Office supplies', 'Gas for company car', 'Business lunch'],
        accounts: {
            debit: 'Expense Account',
            credit: 'Cash/Bank Account'
        }
    },
    {
        id: 'income_received',
        title: 'Receive Money',
        description: 'Record money coming into your business',
        icon: _jsx(DollarSign, { className: "w-5 h-5" }),
        color: 'bg-green-50 text-green-600 border-green-200',
        examples: ['Customer payment', 'Service income', 'Product sales'],
        accounts: {
            debit: 'Cash/Bank Account',
            credit: 'Revenue Account'
        }
    },
    {
        id: 'bill_payment',
        title: 'Pay Bills',
        description: 'Record payments for utilities, rent, etc.',
        icon: _jsx(Building, { className: "w-5 h-5" }),
        color: 'bg-blue-50 text-blue-600 border-blue-200',
        examples: ['Monthly rent', 'Electricity bill', 'Internet service'],
        accounts: {
            debit: 'Expense Account',
            credit: 'Cash/Bank Account'
        }
    },
    {
        id: 'loan_payment',
        title: 'Loan Payment',
        description: 'Record loan or credit payments',
        icon: _jsx(CreditCard, { className: "w-5 h-5" }),
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        examples: ['Business loan payment', 'Equipment financing', 'Credit card payment'],
        accounts: {
            debit: 'Loan Account',
            credit: 'Cash/Bank Account'
        }
    }
];
const EXPENSE_CATEGORIES = [
    { icon: _jsx(Coffee, { className: "w-4 h-4" }), label: 'Meals & Entertainment', account: 'Meals Expense' },
    { icon: _jsx(Car, { className: "w-4 h-4" }), label: 'Vehicle & Transport', account: 'Vehicle Expense' },
    { icon: _jsx(Building, { className: "w-4 h-4" }), label: 'Rent & Utilities', account: 'Rent Expense' },
    { icon: _jsx(Smartphone, { className: "w-4 h-4" }), label: 'Technology', account: 'Technology Expense' },
    { icon: _jsx(Receipt, { className: "w-4 h-4" }), label: 'Office Supplies', account: 'Office Supplies' },
    { icon: _jsx(Lightbulb, { className: "w-4 h-4" }), label: 'Marketing', account: 'Marketing Expense' }
];
export function QuickJournalEntry({ onTransactionSelect }) {
    const navigate = useNavigate();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleQuickCreate = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDialogOpen(true);
    };
    const handleCreateEntry = () => {
        // Navigate to the full journal entry page with pre-filled data
        const queryParams = new URLSearchParams({
            type: selectedTransaction.id,
            amount: amount,
            description: description,
            category: selectedCategory
        });
        navigate(`/dashboard/journal/new?${queryParams.toString()}`);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5" }), "Quick Journal Entry"] }), _jsx(CardDescription, { children: "Create common business transactions with just a few clicks" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: QUICK_TRANSACTIONS.map((transaction) => (_jsx(Card, { className: "cursor-pointer hover:shadow-md transition-all hover:scale-105", onClick: () => handleQuickCreate(transaction), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${transaction.color}`, children: transaction.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-sm mb-1", children: transaction.title }), _jsx("p", { className: "text-xs text-muted-foreground mb-2", children: transaction.description }), _jsx("div", { className: "flex flex-wrap gap-1", children: transaction.examples.slice(0, 2).map((example, idx) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: example }, idx))) })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-muted-foreground" })] }) }) }, transaction.id))) }), _jsx("div", { className: "mt-6 text-center", children: _jsxs(Button, { variant: "outline", onClick: () => navigate('/dashboard/journal/new'), className: "w-full md:w-auto", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Custom Entry"] }) })] })] }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [selectedTransaction?.icon, selectedTransaction?.title] }), _jsx(DialogDescription, { children: selectedTransaction?.description })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "amount", children: "Amount ($)" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", placeholder: "0.00", value: amount, onChange: (e) => setAmount(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", placeholder: `What was this ${selectedTransaction?.title.toLowerCase()} for?`, value: description, onChange: (e) => setDescription(e.target.value), rows: 3 })] }), selectedTransaction?.id === 'expense_payment' && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Expense Category" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: EXPENSE_CATEGORIES.map((category, idx) => (_jsx(Card, { className: `cursor-pointer transition-colors ${selectedCategory === category.account
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-muted/50'}`, onClick: () => setSelectedCategory(category.account), children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [category.icon, _jsx("span", { className: "text-xs font-medium", children: category.label })] }) }) }, idx))) })] })), _jsxs("div", { className: "bg-muted/50 p-3 rounded-lg", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-2", children: "This will create:" }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { children: ["Debit: ", selectedTransaction?.accounts.debit] }), _jsxs("span", { className: "text-green-600", children: ["+$", amount || '0.00'] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { children: ["Credit: ", selectedTransaction?.accounts.credit] }), _jsxs("span", { className: "text-red-600", children: ["-$", amount || '0.00'] })] })] })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), className: "flex-1", children: "Cancel" }), _jsx(Button, { onClick: handleCreateEntry, disabled: !amount || !description, className: "flex-1", children: "Continue" })] })] })] }) })] }));
}
