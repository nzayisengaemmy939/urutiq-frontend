// Simple test for jsPDF autotable integration
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Test function to verify autotable works
export function testAutoTable() {
  try {
    const doc = new jsPDF()
    
    // Test the autoTable function
    autoTable(doc, {
      head: [['Name', 'Amount']],
      body: [['Test Item', '$100.00']],
      startY: 20,
    })
    
    console.log('AutoTable test passed!')
    return true
  } catch (error) {
    console.error('AutoTable test failed:', error)
    return false
  }
}
