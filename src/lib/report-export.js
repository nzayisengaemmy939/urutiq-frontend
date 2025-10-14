import jsPDF from 'jspdf';
import 'jspdf-autotable';
export const exportToPDF = (options) => {
    const doc = new jsPDF();
    // Add title
    doc.setFontSize(20);
    doc.text(options.title, 14, 22);
    // Add subtitle if provided
    if (options.subtitle) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(options.subtitle, 14, 30);
    }
    // Add generation date
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    // Prepare table data
    const tableData = options.data.map(row => options.columns.map(col => {
        const value = row[col.key];
        if (typeof value === 'number') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(value);
        }
        return String(value || '');
    }));
    // Add table
    doc.autoTable({
        head: [options.columns.map(col => col.label)],
        body: tableData,
        startY: 50,
        styles: {
            fontSize: 8,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        },
        columnStyles: options.columns.reduce((acc, col, index) => {
            acc[index] = {
                halign: col.align || 'left',
                cellWidth: col.width || 'auto',
            };
            return acc;
        }, {}),
    });
    // Add summary if provided
    if (options.summary && options.summary.length > 0) {
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 14, finalY);
        options.summary.forEach((item, index) => {
            const y = finalY + 10 + (index * 8);
            doc.setFontSize(10);
            doc.text(item.label, 14, y);
            doc.text(item.value, 100, y);
        });
    }
    // Save the PDF
    const filename = options.filename || `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};
export const exportToCSV = (options) => {
    const headers = options.columns.map(col => col.label);
    const csvData = [
        headers,
        ...options.data.map(row => options.columns.map(col => {
            const value = row[col.key];
            if (typeof value === 'number') {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            }
            return String(value || '');
        }))
    ];
    const csvContent = csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = options.filename || `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
export const exportToExcel = async (options) => {
    // This would require xlsx library
    // For now, we'll just export as CSV
    exportToCSV(options);
};
// Helper function to format currency for display
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};
// Helper function to format date for display
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};
// Helper function to format percentage for display
export const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};
