# Chart of Accounts Testing Guide

## Manual Testing Checklist

### 🎯 **Core Functionality Tests**

#### 1. Initial Load & Display
- [ ] Component loads without errors
- [ ] Stats dashboard displays (Total Accounts, Active Accounts, Account Types, Max Depth)
- [ ] Default tab is "Accounts"
- [ ] Empty state displays if no accounts exist
- [ ] Loading spinner appears during data fetch

#### 2. Search & Filter Testing
- [ ] Search input filters accounts by name/code/description
- [ ] Account type filter works correctly
- [ ] Status filter (All/Active/Inactive) functions properly
- [ ] "Show Inactive" toggle displays/hides inactive accounts
- [ ] Filters work in combination
- [ ] Search results update in real-time

#### 3. View Modes
- [ ] List View: Table format with all account details
- [ ] Tree View: Hierarchical display with parent-child relationships
- [ ] Grid View: Card-based layout
- [ ] View mode selection persists during operations
- [ ] Data displays correctly in all view modes

#### 4. Account Management (CRUD)
- [ ] **Create**: Add Account button opens form dialog
- [ ] **Create**: Form validation works (required fields)
- [ ] **Create**: Account is added to list after creation
- [ ] **Read**: Account details display correctly
- [ ] **Update**: Edit button opens pre-filled form
- [ ] **Update**: Changes save and reflect immediately
- [ ] **Delete**: Delete button shows confirmation dialog
- [ ] **Delete**: Account is removed after confirmation

#### 5. Bulk Operations
- [ ] Individual checkboxes select accounts
- [ ] "Select All" checkbox selects all filtered accounts
- [ ] Selection count updates correctly
- [ ] Bulk actions bar appears when items selected
- [ ] "Activate" bulk action works for multiple accounts
- [ ] "Deactivate" bulk action works for multiple accounts
- [ ] "Export Selected" generates CSV for selected accounts
- [ ] "Delete Selected" shows confirmation and removes accounts
- [ ] "Clear Selection" deselects all accounts

#### 6. Import/Export Features
- [ ] **Export All**: Downloads CSV with all accounts
- [ ] **Export Selected**: Downloads CSV with selected accounts only
- [ ] **Import**: File upload dialog opens
- [ ] **Import**: Drag & drop area accepts CSV files
- [ ] **Import**: Template download provides correct format
- [ ] **Import**: Validation errors display for invalid data
- [ ] **Import**: Successful import adds accounts to list

#### 7. Account Types Management
- [ ] Account Types tab displays existing types
- [ ] Add Account Type button opens form
- [ ] Account type form validation works
- [ ] Normal balance selection (Debit/Credit) required
- [ ] Account types can be edited
- [ ] Account types can be deleted (if not in use)
- [ ] Account type changes reflect in account forms

#### 8. Form Validation
- [ ] Required fields show error messages
- [ ] Account code uniqueness validation
- [ ] Parent account circular reference prevention
- [ ] Account type selection validation
- [ ] Form submissions disabled with validation errors
- [ ] Error messages clear when fields corrected

### 🔧 **Advanced Features Tests**

#### 9. Pagination
- [ ] Page navigation works correctly
- [ ] Page size selector functions
- [ ] Total count displays accurately
- [ ] Navigation disabled appropriately (first/last page)

#### 10. Hierarchical Features
- [ ] Parent account selection excludes children
- [ ] Tree view shows proper indentation
- [ ] Parent-child relationships display correctly
- [ ] Depth calculation accurate

#### 11. Real-time Features
- [ ] Auto-refresh updates data
- [ ] Last updated timestamp accurate
- [ ] Changes from other users appear (if applicable)

#### 12. Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Server errors handled gracefully
- [ ] Loading states during operations
- [ ] Retry mechanisms work

### 🎨 **UI/UX Tests**

#### 13. Responsive Design
- [ ] Component adapts to different screen sizes
- [ ] Mobile view usable on small screens
- [ ] Tablet view maintains functionality
- [ ] Desktop view shows all features

#### 14. Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility
- [ ] Focus management proper
- [ ] Color contrast adequate
- [ ] ARIA labels present

#### 15. Visual Design
- [ ] Consistent with security page layout
- [ ] Professional appearance
- [ ] Proper spacing and alignment
- [ ] Icons and colors appropriate
- [ ] Loading states visually clear

### ⚡ **Performance Tests**

#### 16. Large Dataset Handling
- [ ] Handles 1000+ accounts efficiently
- [ ] Search performance acceptable
- [ ] Pagination reduces load times
- [ ] Memory usage reasonable

#### 17. Operation Speed
- [ ] CRUD operations complete quickly
- [ ] Bulk operations handle multiple items
- [ ] Import/export processes efficiently
- [ ] UI remains responsive during operations

### 🔒 **Security Tests**

#### 18. Data Validation
- [ ] Input sanitization prevents XSS
- [ ] SQL injection protection
- [ ] File upload validation
- [ ] Data type enforcement

#### 19. Access Control
- [ ] Unauthorized actions prevented
- [ ] Role-based permissions respected
- [ ] Tenant isolation maintained

## Common Issues & Solutions

### Issue: Component Not Loading
**Symptoms**: Blank screen or error messages
**Solutions**:
1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check authentication status
4. Clear browser cache

### Issue: Search Not Working
**Symptoms**: Search returns no results
**Solutions**:
1. Check search indexing
2. Verify database connectivity
3. Test with different search terms
4. Check for special characters

### Issue: Slow Performance
**Symptoms**: Delayed responses, UI lag
**Solutions**:
1. Enable pagination
2. Optimize database queries
3. Implement caching
4. Reduce data payload

### Issue: Import Failing
**Symptoms**: CSV import errors
**Solutions**:
1. Use provided template format
2. Check data validation rules
3. Verify file encoding (UTF-8)
4. Remove special characters

## Test Data Examples

### Sample Accounts CSV
```csv
code,name,accountType,parentCode,description,isActive
1000,Cash,Asset,,Primary cash account,true
1100,Accounts Receivable,Asset,,Customer receivables,true
2000,Accounts Payable,Liability,,Vendor payables,true
3000,Common Stock,Equity,,Company equity,true
4000,Sales Revenue,Revenue,,Product sales,true
5000,Cost of Goods Sold,Expense,,Direct costs,true
```

### Sample Account Types
```csv
code,name,normalBalance,category,description
ASSET,Asset,debit,Balance Sheet,Company assets
LIABILITY,Liability,credit,Balance Sheet,Company liabilities
EQUITY,Equity,credit,Balance Sheet,Owner equity
REVENUE,Revenue,credit,Income Statement,Income sources
EXPENSE,Expense,debit,Income Statement,Business expenses
```

## Automation Testing Scripts

For automated testing, consider implementing:
- Unit tests for individual functions
- Integration tests for API calls
- E2E tests for user workflows
- Performance tests for large datasets
- Accessibility tests for compliance

## Test Environment Setup

Ensure testing environment has:
- Sample data populated
- All account types configured
- Test user accounts with appropriate permissions
- Network conditions simulated
- Error scenarios prepared
