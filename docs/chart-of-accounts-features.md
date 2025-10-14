# Chart of Accounts Management - Full Feature Documentation

## Overview

The Chart of Accounts Management system provides comprehensive CRUD operations and advanced features for managing your organization's account structure and hierarchy. This component is fully integrated with the UrutiIQ accounting system.

## Key Features

### 🔍 **Search & Filtering**
- **Real-time Search**: Search across account names, codes, descriptions, and types
- **Type Filtering**: Filter accounts by account type
- **Status Filtering**: Filter by active/inactive status
- **Advanced Filters**: Show/hide inactive accounts with toggle switch

### 📊 **Multiple View Modes**
- **List View**: Traditional table-style display with detailed information
- **Tree View**: Hierarchical display showing parent-child relationships
- **Grid View**: Card-based layout for better visual organization

### ✅ **Bulk Operations**
- **Multi-Select**: Checkbox selection for individual accounts
- **Select All**: Quick selection of all filtered accounts
- **Bulk Actions**:
  - Activate/Deactivate multiple accounts
  - Export selected accounts to CSV
  - Delete multiple accounts (with confirmation)

### 📥 **Import/Export**
- **CSV Export**: Export all accounts or selected accounts
- **CSV Import**: Import accounts from CSV files
- **Template Download**: Download CSV template for proper formatting
- **Drag & Drop**: File upload with drag and drop support

### 🔧 **Account Management**
- **Full CRUD Operations**: Create, Read, Update, Delete accounts
- **Account Types**: Manage account types with normal balance configuration
- **Hierarchical Structure**: Support for parent-child account relationships
- **Validation**: Form validation for required fields and data integrity

### 📈 **Dashboard & Analytics**
- **Summary Stats**: Total accounts, active accounts, account types, hierarchy depth
- **Real-time Updates**: Automatic refresh of data
- **Last Updated**: Track when the chart was last modified

### ⚙️ **Advanced Features**
- **Pagination**: Efficient handling of large account lists
- **Real-time Validation**: Form validation with error messages
- **Responsive Design**: Mobile-friendly interface
- **Keyboard Shortcuts**: Enhanced accessibility
- **Loading States**: Proper loading indicators
- **Error Handling**: Comprehensive error messages

## Component Structure

### Main Tabs
1. **Accounts**: Main account management interface
2. **Account Types**: Manage account categories and types
3. **Settings**: Configuration and preferences

### Account Management Features

#### Search & Filter Bar
```tsx
- Search input with icon
- Account type dropdown filter
- Status filter (All/Active/Inactive)
- Show inactive toggle switch
- View mode selector (List/Tree/Grid)
```

#### Action Controls
```tsx
- Add Account button
- Add Account Type button
- Import CSV button
- Export All button
- Refresh button
- Selected count badge
```

#### Bulk Actions Bar
```tsx
- Selection count display
- Activate/Deactivate buttons
- Export selected button
- Delete selected button (destructive)
- Clear selection button
```

#### Account Display
```tsx
- Select all checkbox
- Individual account rows/cards/tree nodes
- Account information display
- Action dropdown menus
- Status badges
- Type badges
```

### Form Dialogs

#### Add/Edit Account Form
- Account Code (required)
- Account Name (required)
- Account Type (dropdown, required)
- Parent Account (optional, dropdown)
- Description (optional, textarea)
- Active status (toggle switch)

#### Add/Edit Account Type Form
- Type Name (required)
- Normal Balance (Debit/Credit, required)
- Category (optional)
- Description (optional, textarea)

#### Import Dialog
- File upload area with drag & drop
- CSV template download
- Format validation alerts
- Import progress indicator

## API Integration

### Account Operations
```typescript
// Get all accounts with pagination and filters
accountingApi.chartOfAccountsApi.getAll(companyId, includeInactive, page, pageSize)

// Get account by ID
accountingApi.chartOfAccountsApi.getById(id)

// Create new account
accountingApi.chartOfAccountsApi.create(accountData)

// Update existing account
accountingApi.chartOfAccountsApi.update(id, accountData)

// Delete account
accountingApi.chartOfAccountsApi.delete(id)

// Get account balance
accountingApi.chartOfAccountsApi.getBalance(id, asOf)

// Get summary statistics
accountingApi.chartOfAccountsApi.getSummary(companyId)
```

### Account Type Operations
```typescript
// Get all account types
accountingApi.accountTypesApi.getAll(companyId)

// Create new account type
accountingApi.accountTypesApi.create(typeData)

// Update account type
accountingApi.accountTypesApi.update(id, typeData)

// Delete account type
accountingApi.accountTypesApi.delete(id)
```

## Data Models

### Account Interface
```typescript
interface Account {
  id: string
  code: string
  name: string
  description?: string
  accountTypeId: string
  accountType?: string
  parentId?: string
  parent?: Account
  children: Account[]
  isActive: boolean
  companyId?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}
```

### Account Type Interface
```typescript
interface AccountType {
  id: string
  code: string
  name: string
  description?: string
  normalBalance: 'debit' | 'credit'
  category?: string
  companyId?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
}
```

### Account Summary Interface
```typescript
interface AccountSummary {
  totalAccounts: number
  activeAccounts: number
  totalAccountTypes: number
  maxDepth: number
  lastUpdated: string
}
```

## Usage Examples

### Basic Account Creation
```typescript
const newAccount = {
  code: "1000",
  name: "Cash",
  accountTypeId: "asset-type-id",
  description: "Primary cash account",
  isActive: true
}

await accountingApi.chartOfAccountsApi.create(newAccount)
```

### Bulk Operations
```typescript
// Activate multiple accounts
const selectedIds = ["account-1", "account-2", "account-3"]
await Promise.all(
  selectedIds.map(id => 
    accountingApi.chartOfAccountsApi.update(id, { isActive: true })
  )
)
```

### Export to CSV
```typescript
const accounts = await accountingApi.chartOfAccountsApi.getAll()
const csvContent = generateCSV(accounts)
downloadCSV(csvContent, "chart-of-accounts.csv")
```

## Best Practices

### Account Numbering
- Use consistent numbering scheme (e.g., 1000-1999 for assets)
- Leave gaps for future expansion
- Use meaningful prefixes for account types

### Account Hierarchy
- Keep hierarchy depth reasonable (3-4 levels max)
- Use logical grouping for related accounts
- Consider reporting requirements when structuring

### Data Management
- Regularly backup account data
- Use descriptive account names
- Maintain consistent naming conventions
- Document account purposes in descriptions

### Performance Optimization
- Use pagination for large account lists
- Implement proper caching strategies
- Use bulk operations for mass updates
- Optimize search queries

## Security Considerations

- **Access Control**: Implement role-based permissions
- **Audit Trail**: Log all account modifications
- **Data Validation**: Validate all input data
- **Backup**: Regular backups of account structure
- **Multi-tenancy**: Proper tenant isolation

## Error Handling

The component includes comprehensive error handling for:
- Network failures
- Validation errors
- Permission errors
- Data conflicts
- Server errors

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Accessible color schemes
- **Focus Management**: Proper focus handling
- **Alternative Text**: Descriptive text for icons

## Future Enhancements

### Planned Features
- Account balance integration
- Transaction history view
- Advanced reporting
- Account templates
- Automated account creation
- Integration with external systems
- Mobile app support
- Real-time collaboration

### API Enhancements
- GraphQL support
- Real-time subscriptions
- Advanced search capabilities
- Bulk import/export improvements
- Version control for account changes

## Troubleshooting

### Common Issues
1. **Accounts not loading**: Check API connectivity and permissions
2. **Search not working**: Verify search index and database connectivity
3. **Import failing**: Check CSV format and data validation
4. **Performance issues**: Review pagination settings and data volume

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment variables to get detailed operation logs.

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
