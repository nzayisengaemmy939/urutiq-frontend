import React from 'react'

interface AccessibleTableProps {
  caption: string
  headers: string[]
  data: any[]
  renderRow: (item: any, index: number) => React.ReactNode
  onRowSelect?: (item: any) => void
  selectedRowId?: string
}

export const AccessibleAccountingTable: React.FC<AccessibleTableProps> = ({
  caption,
  headers,
  data,
  renderRow,
  onRowSelect,
  selectedRowId
}) => {
  const handleKeyDown = (event: React.KeyboardEvent, item: any) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRowSelect?.(item)
    }
  }

  return (
    <div role="region" aria-labelledby="table-caption">
      <table className="w-full" role="table" aria-describedby="table-description">
        <caption id="table-caption" className="sr-only">
          {caption}
        </caption>
        <thead>
          <tr role="row">
            {headers.map((header, index) => (
              <th
                key={index}
                role="columnheader"
                scope="col"
                className="text-left p-2 font-medium border-b"
                tabIndex={0}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              role="row"
              className={`border-b hover:bg-muted/50 focus-within:bg-muted/50 ${
                selectedRowId === item.id ? 'bg-primary/10' : ''
              }`}
              tabIndex={onRowSelect ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, item)}
              onClick={() => onRowSelect?.(item)}
              aria-selected={selectedRowId === item.id}
            >
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
      <div id="table-description" className="sr-only">
        Table showing {data.length} items. Use arrow keys to navigate and Enter to select.
      </div>
    </div>
  )
}
