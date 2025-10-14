# Expense Management - Implemented Features

This document summarizes the expense management capabilities implemented in the frontend app and how to use them.

## Key capabilities

- Receipt capture and OCR
  - Upload image/PDF receipts, preview inline
  - OCR extraction (Tesseract.js) to auto-fill vendor, amount, date, short description
  - Company selection persisted to localStorage

- Expense creation and listing
  - Quick create from receipt modal
  - Expenses tab with search, status filter, category filter, date range, department and project filters
  - CSV export (respects all filters) including Department and Project columns

- Policy and approvals
  - Client-side enforcement checks on submit for:
    - Amount limits (amount_limit rules)
    - Vendor restrictions (vendor_restriction rules)
  - Approval enforcement: if an approval_required rule exists, only approver roles (admin/accountant) can approve
  - Inline rule management:
    - Create new rules (pre-filled "Require Approval Policy" shortcut)
    - Enable/disable rule
    - Edit rule (conditions/actions JSON), update
    - Delete rule

- Reimbursements
  - Reimburse modal to mark approved expenses as paid, with method/date/amount/reference

- Bank/ledger matching (assist)
  - Matching modal to find nearby ledger entries by date range and amount

- Structured fields
  - Department and Project captured as structured fields on expense creation
  - Filters and exports use structured fields; UI falls back to parsing legacy tags when needed

## Where to find

- Page: `apps/frontend/app/expenses/page.tsx`
  - Tabs: Categories, Budgets, Rules, Expenses
  - Header actions: Scan Receipt (quick add), Export Report (CSV by date/status)
  - Expenses tab actions: Submit, Approve (role-gated), Match (ledger), Reimburse, Edit

- Modals/components
  - `components/receipt-capture.tsx` (OCR receipt quick add)
  - `components/expense-report-modal.tsx` (CSV export by date/status)
  - `components/reimburse-expense-modal.tsx` (mark as paid)
  - `components/expense-matching-modal.tsx` (candidate matches)
  - `components/edit-expense-modal.tsx` (update fields)

## APIs used (frontend wrappers)

- `lib/api/accounting.ts` – `expenseApi`
  - `getExpenseCategories`, `createExpenseCategory`
  - `getExpenseRules`, `createExpenseRule`, `updateExpenseRule`, `deleteExpenseRule`
  - `getExpenses`, `createExpense`, `updateExpense`, `submitExpense`, `approveExpense`, `rejectExpense`

## Notes / next steps

- Optionally persist Department/Project in backend schema if not already present
- Add role-based UI gating for approval actions in addition to client-side checks
- Add file upload persistence (receipt storage URL) if API supports it
- Add mileage/per-diem entry types as separate forms if required


