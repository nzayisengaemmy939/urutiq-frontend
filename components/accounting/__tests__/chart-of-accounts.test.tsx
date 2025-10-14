import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartOfAccounts } from '../chart-of-accounts'
import * as accountingApi from '@/lib/api/accounting'

// Mock the API
jest.mock('@/lib/api/accounting')
const mockAccountingApi = accountingApi as jest.Mocked<typeof accountingApi>

describe('ChartOfAccounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders account list correctly', async () => {
    const mockAccounts = [
      {
        id: '1',
        name: 'Cash',
        code: '1000',
        accountType: 'Asset',
        debitBalance: 10000,
        creditBalance: 0
      }
    ]

    mockAccountingApi.chartOfAccountsApi.getAll.mockResolvedValue(mockAccounts)

    render(<ChartOfAccounts />)

    await waitFor(() => {
      expect(screen.getByText('Cash')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
    })
  })

  it('validates account form correctly', async () => {
    render(<ChartOfAccounts />)

    const addButton = screen.getByText('Add Account')
    fireEvent.click(addButton)

    const submitButton = screen.getByText('Save Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Account name is required')).toBeInTheDocument()
    })
  })

  it('creates account successfully', async () => {
    const user = userEvent.setup()
    
    mockAccountingApi.chartOfAccountsApi.create.mockResolvedValue({
      id: '2',
      name: 'Bank Account',
      code: '1001',
      accountTypeId: '1'
    })

    render(<ChartOfAccounts />)

    const addButton = screen.getByText('Add Account')
    await user.click(addButton)

    await user.type(screen.getByLabelText('Account Name'), 'Bank Account')
    await user.type(screen.getByLabelText('Account Code'), '1001')
    
    const submitButton = screen.getByText('Save Account')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockAccountingApi.chartOfAccountsApi.create).toHaveBeenCalledWith({
        name: 'Bank Account',
        code: '1001',
        accountTypeId: '1',
        parentId: '',
        isActive: true,
        description: ''
      })
    })
  })
})
