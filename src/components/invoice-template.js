import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Download, Printer, Share2, Copy } from "lucide-react";
import { PaymentButtonProminent } from "../components/payment-button";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator";
import { useToast } from "@/hooks/use-toast";
export function InvoiceTemplate({ invoice, company, onDownloadPDF, onPrint, onPaymentSuccess, onPaymentError }) {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const canvasRef = useRef(null);
    const formatCurrency = (amount, currency) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        }
        catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' };
            case 'sent': return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' };
            case 'draft': return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' };
            case 'overdue': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' };
            case 'cancelled': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' };
            default: return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' };
        }
    };
    const templateStyle = company.invoiceTemplate || 'professional';
    const primaryColor = company.primaryColor || '#1f2937';
    const secondaryColor = company.secondaryColor || '#3b82f6';
    const fontFamily = company.fontFamily || 'Inter';
    // Generate QR code for payment URL or invoice details
    useEffect(() => {
        const generateQRCode = async () => {
            try {
                const qrData = invoice.paymentUrl || `Invoice: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.totalAmount, invoice.currency)}\nDue: ${invoice.dueDate || 'N/A'}`;
                const qrUrl = await QRCode.toDataURL(qrData, {
                    width: 120,
                    margin: 1,
                    color: {
                        dark: primaryColor,
                        light: '#FFFFFF'
                    }
                });
                setQrCodeUrl(qrUrl);
            }
            catch (error) {
                console.error('Error generating QR code:', error);
            }
        };
        if (company.showQRCode !== false) {
            generateQRCode();
        }
    }, [invoice, company.showQRCode, primaryColor]);
    // Generate barcode for invoice number
    useEffect(() => {
        const generateBarcode = () => {
            try {
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // Simple barcode generation (Code 128 style)
                        canvas.width = 200;
                        canvas.height = 50;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = primaryColor;
                        const barWidth = 2;
                        let x = 10;
                        // Generate bars based on invoice number
                        const invoiceCode = invoice.invoiceNumber.replace(/[^0-9]/g, '') || '123456';
                        for (let i = 0; i < invoiceCode.length; i++) {
                            const digit = parseInt(invoiceCode[i]);
                            for (let j = 0; j < 5; j++) {
                                if ((digit + j) % 2 === 0) {
                                    ctx.fillRect(x, 5, barWidth, 35);
                                }
                                x += barWidth + 1;
                            }
                            x += 3;
                        }
                        // Add invoice number text below barcode
                        ctx.fillStyle = '#374151';
                        ctx.font = '10px monospace';
                        ctx.textAlign = 'center';
                        ctx.fillText(invoice.invoiceNumber, canvas.width / 2, 47);
                        setBarcodeUrl(canvas.toDataURL());
                    }
                }
            }
            catch (error) {
                console.error('Error generating barcode:', error);
            }
        };
        if (company.showBarcode !== false) {
            generateBarcode();
        }
    }, [invoice.invoiceNumber, company.showBarcode, primaryColor]);
    const { toast } = useToast();
    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        }
        else {
            window.print();
        }
    };
    const handleDownloadPDF = async () => {
        try {
            // Prioritize frontend generator for better templates
            const generator = new InvoicePDFGenerator({
                invoice: {
                    ...invoice,
                    subtotal: calculateSubtotal(),
                    taxAmount: calculateTax()
                },
                company
            });
            await generator.download();
            toast({
                title: "PDF Downloaded",
                description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`
            });
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Download Failed",
                description: "There was an error generating the PDF. Please try again.",
                variant: "destructive"
            });
            // Fallback to backend API if frontend generator fails
            if (onDownloadPDF) {
                onDownloadPDF();
            }
        }
    };
    const handleShareInvoice = async () => {
        try {
            const generator = new InvoicePDFGenerator({
                invoice: {
                    ...invoice,
                    subtotal: calculateSubtotal(),
                    taxAmount: calculateTax()
                },
                company
            });
            const pdfBlob = await generator.generate();
            const pdfFile = new File([pdfBlob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
            if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    title: `Invoice ${invoice.invoiceNumber}`,
                    text: `Invoice for ${formatCurrency(invoice.totalAmount, invoice.currency)}`,
                    files: [pdfFile]
                });
            }
            else {
                // Fallback: copy link
                const url = invoice.paymentUrl || window.location.href;
                await navigator.clipboard.writeText(url);
                toast({
                    title: "Link Copied",
                    description: "Invoice link has been copied to clipboard."
                });
            }
        }
        catch (error) {
            console.error('Error sharing invoice:', error);
            toast({
                title: "Share Failed",
                description: "There was an error sharing the invoice.",
                variant: "destructive"
            });
        }
    };
    const calculateSubtotal = () => {
        return invoice.lines?.reduce((sum, line) => sum + line.lineTotal, 0) || invoice.subtotal || 0;
    };
    const calculateTax = () => {
        return invoice.taxAmount || invoice.lines?.reduce((sum, line) => {
            const lineSubtotal = line.lineTotal;
            const taxRate = line.taxRate || 0;
            return sum + (lineSubtotal * taxRate / 100);
        }, 0) || 0;
    };
    const renderProfessionalTemplate = () => {
        const statusStyle = getStatusColor(invoice.status);
        const subtotal = calculateSubtotal();
        const taxAmount = calculateTax();
        const discount = invoice.discountAmount || 0;
        return (_jsxs("div", { className: "max-w-5xl mx-auto bg-white shadow-xl print:shadow-none print:max-w-none", style: { fontFamily }, children: [_jsx("canvas", { ref: canvasRef, style: { display: 'none' } }), _jsxs("div", { className: "relative bg-white border-b-2 print:border-b-1", style: { borderColor: primaryColor }, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50" }), _jsx("div", { className: "relative px-8 py-6", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-start space-x-6", children: [company.logoUrl && company.showLogo && (_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-20 h-20 bg-white rounded-lg shadow-md p-2 border", children: _jsx("img", { src: company.logoUrl, alt: `${company.name} logo`, className: "w-full h-full object-contain" }) }) })), _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", style: { color: primaryColor }, children: company.name }), (company.showAddress && company.address) && (_jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("div", { children: company.address }), (company.city || company.state || company.postalCode) && (_jsx("div", { children: [company.city, company.state, company.postalCode].filter(Boolean).join(', ') }))] })), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [company.email && _jsxs("div", { children: ["Email: ", company.email] }), company.phone && _jsxs("div", { children: ["Phone: ", company.phone] }), company.showWebsite && company.website && _jsxs("div", { children: ["Web: ", company.website] }), company.taxId && _jsxs("div", { children: ["Tax ID: ", company.taxId] })] })] })] }), _jsxs("div", { className: "text-right space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-gray-900 mb-2", children: "INVOICE" }), _jsxs("div", { className: "text-2xl font-semibold text-gray-700", children: ["#", invoice.invoiceNumber] })] }), _jsxs("div", { className: `inline-flex items-center px-4 py-2 rounded-full border ${statusStyle.bg} ${statusStyle.text}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full mr-2 ${statusStyle.dot}` }), _jsx("span", { className: "font-semibold text-sm uppercase tracking-wide", children: invoice.status })] }), _jsxs("div", { className: "flex flex-col items-end space-y-3 print:space-y-2", children: [qrCodeUrl && company.showQRCode !== false && (_jsxs("div", { className: "text-center", children: [_jsx("img", { src: qrCodeUrl, alt: "Invoice QR Code", className: "w-24 h-24 print:w-20 print:h-20" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Scan to Pay" })] })), barcodeUrl && company.showBarcode !== false && (_jsx("div", { className: "text-center", children: _jsx("img", { src: barcodeUrl, alt: "Invoice Barcode", className: "h-12 print:h-10" }) }))] })] })] }) })] }), _jsx("div", { className: "px-8 py-6 bg-gray-50 print:bg-white", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2", children: "Bill To" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("div", { className: "font-semibold text-gray-900 text-base", children: invoice.customer?.name }), invoice.customer?.address && _jsx("div", { className: "text-gray-600", children: invoice.customer.address }), invoice.customer?.email && _jsx("div", { className: "text-gray-600", children: invoice.customer.email }), invoice.customer?.phone && _jsx("div", { className: "text-gray-600", children: invoice.customer.phone }), invoice.customer?.taxId && _jsxs("div", { className: "text-gray-600", children: ["Tax ID: ", invoice.customer.taxId] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2", children: "Invoice Details" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Issue Date:" }), _jsx("span", { className: "font-medium", children: new Date(invoice.issueDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) })] }), invoice.dueDate && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Due Date:" }), _jsx("span", { className: "font-medium", children: new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        }) })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Currency:" }), _jsx("span", { className: "font-medium", children: invoice.currency })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2", children: "Payment Summary" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Amount:" }), _jsx("span", { className: "font-semibold", children: formatCurrency(invoice.totalAmount, invoice.currency) })] }), invoice.balanceDue > 0 && (_jsxs("div", { className: "flex justify-between text-red-600", children: [_jsx("span", { children: "Amount Due:" }), _jsx("span", { className: "font-bold", children: formatCurrency(invoice.balanceDue, invoice.currency) })] })), invoice.status === 'paid' && (_jsx("div", { className: "text-green-600 font-semibold text-center py-2 bg-green-50 rounded", children: "\u2713 PAID IN FULL" }))] })] })] }) }), invoice.lines && invoice.lines.length > 0 && (_jsx("div", { className: "px-8 py-6", children: _jsx("div", { className: "overflow-hidden rounded-lg border border-gray-200", children: _jsxs("table", { className: "w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider", children: "Qty" }), _jsx("th", { className: "px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider", children: "Rate" }), invoice.lines.some(line => line.taxRate && line.taxRate > 0) && (_jsx("th", { className: "px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider", children: "Tax" })), _jsx("th", { className: "px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider", children: "Amount" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: invoice.lines.map((line, index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50', children: [_jsx("td", { className: "px-6 py-4 text-sm text-gray-900 font-medium", children: line.description }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-700 text-center", children: line.quantity }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-700 text-right", children: formatCurrency(line.unitPrice, invoice.currency) }), invoice.lines?.some(l => l.taxRate && l.taxRate > 0) && (_jsx("td", { className: "px-6 py-4 text-sm text-gray-700 text-center", children: line.taxRate ? `${line.taxRate}%` : '—' })), _jsx("td", { className: "px-6 py-4 text-sm text-gray-900 font-semibold text-right", children: formatCurrency(line.lineTotal, invoice.currency) })] }, index))) })] }) }) })), _jsx("div", { className: "px-8 py-6 bg-gray-50 print:bg-white", children: _jsx("div", { className: "flex justify-end", children: _jsxs("div", { className: "w-full max-w-sm space-y-3", children: [_jsxs("div", { className: "flex justify-between py-2 border-b border-gray-300", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Subtotal:" }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: formatCurrency(subtotal, invoice.currency) })] }), discount > 0 && (_jsxs("div", { className: "flex justify-between py-2 border-b border-gray-300", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Discount:" }), _jsxs("span", { className: "text-sm font-semibold text-red-600", children: ["-", formatCurrency(discount, invoice.currency)] })] })), taxAmount > 0 && (_jsxs("div", { className: "flex justify-between py-2 border-b border-gray-300", children: [_jsx("span", { className: "text-sm font-medium text-gray-600", children: "Tax:" }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: formatCurrency(taxAmount, invoice.currency) })] })), _jsxs("div", { className: "flex justify-between py-3 border-t-2 border-gray-400", children: [_jsx("span", { className: "text-lg font-bold text-gray-900", children: "Total:" }), _jsx("span", { className: "text-lg font-bold", style: { color: primaryColor }, children: formatCurrency(invoice.totalAmount, invoice.currency) })] }), invoice.balanceDue > 0 && (_jsxs("div", { className: "flex justify-between py-2 bg-red-50 px-4 rounded border border-red-200", children: [_jsx("span", { className: "text-sm font-bold text-red-700", children: "Balance Due:" }), _jsx("span", { className: "text-sm font-bold text-red-700", children: formatCurrency(invoice.balanceDue, invoice.currency) })] }))] }) }) }), invoice.notes && (_jsxs("div", { className: "px-8 py-4 border-t border-gray-200", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Notes:" }), _jsx("p", { className: "text-sm text-gray-600 whitespace-pre-wrap", children: invoice.notes })] })), invoice.balanceDue > 0 && invoice.status !== 'paid' && (_jsx("div", { className: "px-8 py-6 bg-blue-50 print:hidden border-t border-blue-200", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h3", { className: "text-xl font-semibold text-blue-900", children: "Pay This Invoice Online" }), _jsx("p", { className: "text-blue-700 text-sm", children: "Secure payment processing \u2022 Credit cards, bank transfers, and digital wallets accepted" }), _jsx(PaymentButtonProminent, { invoiceId: invoice.id, amount: invoice.balanceDue, currency: invoice.currency, customerEmail: invoice.customer?.email, customerName: invoice.customer?.name, description: `Payment for Invoice ${invoice.invoiceNumber}`, onPaymentSuccess: onPaymentSuccess, onPaymentError: onPaymentError })] }) })), _jsxs("div", { className: "px-8 py-6 bg-gray-100 print:bg-white border-t border-gray-200", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 text-sm", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Payment Terms" }), _jsx("p", { className: "text-gray-600", children: company.invoiceTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional fees as per our terms of service.' })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Questions?" }), _jsxs("p", { className: "text-gray-600", children: ["Contact us at ", company.email || 'billing@company.com', " or ", company.phone || '+1 (555) 123-4567', "for any questions about this invoice."] })] })] }), company.invoiceFooter && (_jsx("div", { className: "mt-6 pt-4 border-t border-gray-300 text-center", children: _jsx("p", { className: "text-sm text-gray-500", children: company.invoiceFooter }) })), _jsxs("div", { className: "mt-4 text-center text-xs text-gray-400", children: ["Generated on ", new Date().toLocaleString(), " \u2022 Invoice #", invoice.invoiceNumber] })] })] }));
    };
    const renderModernTemplate = () => (_jsxs("div", { className: "max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none", style: { fontFamily }, children: [_jsxs("div", { className: "premium-header relative overflow-hidden", style: {
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: 'white'
                }, children: [_jsx("div", { className: "absolute inset-0 opacity-10", children: _jsx("div", { className: "absolute inset-0", style: {
                                backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                                backgroundSize: '40px 40px, 20px 20px'
                            } }) }), _jsx("div", { className: "relative p-10", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-center gap-8", children: [company.logoUrl && company.showLogo && (_jsx("div", { className: "w-24 h-24 bg-white rounded-2xl p-3 shadow-xl", children: _jsx("img", { src: company.logoUrl, alt: "Company logo", className: "w-full h-full object-contain" }) })), _jsxs("div", { children: [_jsx("h1", { className: "text-5xl font-bold mb-3 tracking-tight", style: { fontFamily }, children: company.name }), _jsxs("div", { className: "text-white/90 text-xl space-y-1", children: [company.showWebsite && company.website && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-white rounded-full" }), _jsx("span", { className: "font-medium", children: company.website })] })), company.showAddress && company.address && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-white rounded-full" }), _jsxs("span", { className: "font-medium", children: [company.address, company.city && `, ${company.city}`, company.state && `, ${company.state}`, company.postalCode && ` ${company.postalCode}`] })] }))] })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20", children: [_jsx("h2", { className: "text-4xl font-bold mb-3 tracking-wider", style: { fontFamily }, children: "INVOICE" }), _jsxs("div", { className: "text-3xl font-bold mb-4", children: ["#", invoice.invoiceNumber] }), _jsx("div", { className: `inline-block px-6 py-3 rounded-full text-sm font-bold ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                        invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'}`, children: invoice.status.toUpperCase() })] }) })] }) })] }), _jsxs("div", { className: "p-10", children: [_jsxs("div", { className: "grid grid-cols-2 gap-16 mb-12", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", style: { backgroundColor: `${primaryColor}20` }, children: _jsx("span", { className: "text-xl font-bold", style: { color: primaryColor }, children: "B" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900", style: { fontFamily }, children: "Bill To" })] }), _jsx("div", { className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200", children: _jsxs("div", { className: "text-gray-900", children: [_jsx("div", { className: "text-2xl font-bold mb-3", children: invoice.customer?.name }), invoice.customer?.email && (_jsxs("div", { className: "text-gray-600 mb-2 flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-lg font-medium", children: invoice.customer.email })] })), invoice.customer?.address && (_jsxs("div", { className: "text-gray-600 flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-lg font-medium", children: invoice.customer.address })] }))] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", style: { backgroundColor: `${secondaryColor}20` }, children: _jsx("span", { className: "text-xl font-bold", style: { color: secondaryColor }, children: "I" }) }), _jsx("h3", { className: "text-2xl font-bold text-gray-900", style: { fontFamily }, children: "Invoice Details" })] }), _jsx("div", { className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-300", children: [_jsx("span", { className: "font-semibold text-gray-600 text-lg", children: "Issue Date:" }), _jsx("span", { className: "font-bold text-gray-900 text-lg", children: new Date(invoice.issueDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) })] }), invoice.dueDate && (_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-gray-300", children: [_jsx("span", { className: "font-semibold text-gray-600 text-lg", children: "Due Date:" }), _jsx("span", { className: "font-bold text-gray-900 text-lg", children: new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) })] })), _jsxs("div", { className: "flex justify-between items-center py-3", children: [_jsx("span", { className: "font-semibold text-gray-600 text-lg", children: "Status:" }), _jsx("span", { className: "font-bold text-gray-900 text-lg capitalize", children: invoice.status })] })] }) })] })] }), invoice.lines && invoice.lines.length > 0 && (_jsx("div", { className: "premium-table mb-12", children: _jsx("div", { className: "overflow-hidden border-2 border-gray-200 rounded-2xl shadow-lg", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { style: { background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }, children: [_jsx("th", { className: "px-8 py-6 text-left font-bold text-white text-lg uppercase tracking-wider", style: { fontFamily }, children: "Description" }), _jsx("th", { className: "px-8 py-6 text-center font-bold text-white text-lg uppercase tracking-wider", style: { fontFamily }, children: "Qty" }), _jsx("th", { className: "px-8 py-6 text-right font-bold text-white text-lg uppercase tracking-wider", style: { fontFamily }, children: "Rate" }), _jsx("th", { className: "px-8 py-6 text-right font-bold text-white text-lg uppercase tracking-wider", style: { fontFamily }, children: "Amount" })] }) }), _jsx("tbody", { className: "divide-y-2 divide-gray-200", children: invoice.lines.map((line, index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-white' : 'bg-gray-50', children: [_jsx("td", { className: "px-8 py-6 text-gray-900 font-semibold text-lg", children: line.description }), _jsx("td", { className: "px-8 py-6 text-center text-gray-700 text-lg", children: line.quantity }), _jsx("td", { className: "px-8 py-6 text-right text-gray-700 text-lg", children: formatCurrency(line.unitPrice, invoice.currency) }), _jsx("td", { className: "px-8 py-6 text-right font-bold text-gray-900 text-lg", children: formatCurrency(line.lineTotal, invoice.currency) })] }, index))) })] }) }) })), _jsx("div", { className: "premium-totals flex justify-end mb-12", children: _jsx("div", { className: "w-96", children: _jsx("div", { className: "bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200 shadow-lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center py-4 border-b-2 border-gray-300", children: [_jsx("span", { className: "text-xl font-bold text-gray-700", style: { fontFamily }, children: "Subtotal" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: formatCurrency(invoice.totalAmount - (invoice.balanceDue > 0 ? invoice.balanceDue : 0), invoice.currency) })] }), invoice.balanceDue > 0 && (_jsxs("div", { className: "flex justify-between items-center py-4 border-b-2 border-gray-300", children: [_jsx("span", { className: "text-xl font-bold text-gray-700", style: { fontFamily }, children: "Balance Due" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: formatCurrency(invoice.balanceDue, invoice.currency) })] })), _jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsx("span", { className: "text-3xl font-bold text-gray-900", style: { fontFamily }, children: "Total" }), _jsx("span", { className: "text-4xl font-bold", style: { color: primaryColor }, children: formatCurrency(invoice.totalAmount, invoice.currency) })] })] }) }) }) }), invoice.balanceDue > 0 && (_jsx("div", { className: "mb-12 p-10 rounded-2xl border-3 border-dashed shadow-lg", style: {
                            borderColor: `${primaryColor}40`,
                            backgroundColor: `${primaryColor}08`
                        }, children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg", style: { backgroundColor: `${primaryColor}20` }, children: _jsx("span", { className: "text-3xl", style: { color: primaryColor }, children: "\uD83D\uDCB3" }) }), _jsx("h3", { className: "text-3xl font-bold mb-4", style: { color: primaryColor, fontFamily }, children: "Pay Online Securely" }), _jsx("p", { className: "text-gray-600 mb-8 text-xl leading-relaxed", children: "Complete your payment instantly using your credit card, debit card, or bank account." }), _jsx(PaymentButtonProminent, { invoiceId: invoice.id, amount: invoice.balanceDue, currency: invoice.currency, customerEmail: invoice.customer?.email, customerName: invoice.customer?.name, description: `Payment for Invoice ${invoice.invoiceNumber}`, onPaymentSuccess: onPaymentSuccess, onPaymentError: onPaymentError })] }) })), _jsxs("div", { className: "premium-footer border-t-4 border-gray-200 pt-10", children: [_jsxs("div", { className: "grid grid-cols-2 gap-16", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3", style: { fontFamily }, children: [_jsx("span", { className: "w-8 h-8 rounded-xl flex items-center justify-center shadow-lg", style: { backgroundColor: `${primaryColor}20` }, children: _jsx("span", { className: "text-sm font-bold", style: { color: primaryColor }, children: "C" }) }), "Contact Information"] }), _jsxs("div", { className: "space-y-3 text-gray-600", children: [company.email && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-lg font-semibold", children: company.email })] })), company.phone && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-lg font-semibold", children: company.phone })] })), company.showWebsite && company.website && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full" }), _jsx("span", { className: "text-lg font-semibold", children: company.website })] }))] })] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3", style: { fontFamily }, children: [_jsx("span", { className: "w-8 h-8 rounded-xl flex items-center justify-center shadow-lg", style: { backgroundColor: `${secondaryColor}20` }, children: _jsx("span", { className: "text-sm font-bold", style: { color: secondaryColor }, children: "T" }) }), "Payment Terms"] }), _jsx("div", { className: "text-gray-600 leading-relaxed text-lg", children: company.invoiceTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.' })] })] }), company.invoiceFooter && (_jsx("div", { className: "mt-10 text-center", children: _jsx("div", { className: "inline-block px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-lg", children: _jsx("p", { className: "text-gray-600 font-bold text-lg", style: { fontFamily }, children: company.invoiceFooter }) }) }))] })] })] }));
    const renderClassicTemplate = () => (_jsx(Card, { className: "max-w-4xl mx-auto shadow-lg", children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-8 border-b-2", style: { borderColor: primaryColor }, children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-4", children: [company.logoUrl && company.showLogo && (_jsx("img", { src: company.logoUrl, alt: "Company logo", className: "w-12 h-12 object-contain" })), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", style: { fontFamily }, children: company.name }), _jsx("div", { className: "text-sm text-gray-600", children: company.showAddress && company.address && (_jsxs("div", { children: [company.address, company.city && `, ${company.city}`, company.state && `, ${company.state}`, company.postalCode && ` ${company.postalCode}`] })) })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-3xl font-bold", style: { color: primaryColor, fontFamily }, children: "INVOICE" }), _jsx("div", { className: "text-lg font-semibold mt-1 text-gray-900", children: invoice.invoiceNumber })] })] }) }), _jsx("div", { className: "p-8", children: _jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Classic template content would go here" }) }) })] }) }));
    const renderMinimalTemplate = () => (_jsx(Card, { className: "max-w-3xl mx-auto shadow-sm", children: _jsxs(CardContent, { className: "p-8", children: [_jsxs("div", { className: "text-center mb-8", children: [company.logoUrl && company.showLogo && (_jsx("img", { src: company.logoUrl, alt: "Company logo", className: "w-16 h-16 object-contain mx-auto mb-4" })), _jsx("h1", { className: "text-2xl font-light text-gray-900", style: { fontFamily }, children: company.name }), _jsxs("div", { className: "text-sm text-gray-500 mt-2", children: ["Invoice ", invoice.invoiceNumber] })] }), _jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Minimal template content would go here" }) })] }) }));
    const renderTemplate = () => {
        switch (templateStyle) {
            case 'modern':
                return renderModernTemplate();
            case 'classic':
                return renderClassicTemplate();
            case 'minimal':
                return renderMinimalTemplate();
            case 'professional':
            default:
                return renderProfessionalTemplate();
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("style", { children: `
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-b-1 { border-bottom-width: 1px !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:w-20 { width: 5rem !important; }
          .print\\:h-20 { height: 5rem !important; }
          .print\\:h-10 { height: 2.5rem !important; }
          .print\\:space-y-2 > * + * { margin-top: 0.5rem !important; }
          .print\\:hidden { display: none !important; }
          .no-print { display: none !important; }
          
          body { 
            margin: 0; padding: 0; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          
          .invoice-container { 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          
          .invoice-page {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          .totals-section { page-break-inside: avoid; }
          .footer-section { page-break-inside: avoid; }
          
          /* Force colors in print */
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .text-blue-600 { color: #2563eb !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
        }
        
        @page {
          margin: 0.5in;
          size: A4;
        }
      ` }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg shadow-sm border no-print", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs(Badge, { variant: "outline", className: "text-blue-600 border-blue-600 px-3 py-1.5 font-medium", children: [templateStyle.charAt(0).toUpperCase() + templateStyle.slice(1), " Template"] }), _jsxs("div", { className: `inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(invoice.status).bg} ${getStatusColor(invoice.status).text}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full mr-2 ${getStatusColor(invoice.status).dot}` }), invoice.status.toUpperCase()] }), _jsx(Badge, { variant: "secondary", className: "px-3 py-1.5", children: formatCurrency(invoice.totalAmount, invoice.currency) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "px-4 py-2", children: [_jsx(Printer, { className: "w-4 h-4 mr-2" }), "Print"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleDownloadPDF, className: "px-4 py-2", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download PDF"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: async () => {
                                    try {
                                        const url = invoice.paymentUrl || window.location.href;
                                        await navigator.clipboard.writeText(url);
                                        toast({
                                            title: "Link Copied",
                                            description: "Invoice link has been copied to clipboard."
                                        });
                                    }
                                    catch (error) {
                                        console.error('Error copying link:', error);
                                    }
                                }, className: "px-4 py-2", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy Link"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: handleShareInvoice, className: "px-4 py-2", children: [_jsx(Share2, { className: "w-4 h-4 mr-2" }), "Share"] })] })] }), _jsx("div", { className: "invoice-container invoice-page", children: renderTemplate() })] }));
}
