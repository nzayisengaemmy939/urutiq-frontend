import React from 'react'
import { cn } from '@/lib/utils'

export type SegmentedTab = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

type SegmentedTabsProps = {
  tabs: SegmentedTab[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function SegmentedTabs({ tabs, value, onChange, className }: SegmentedTabsProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-4', className)}>
      <div className="flex space-x-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = value === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                isActive
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


