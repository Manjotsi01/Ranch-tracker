 import React, { useState } from 'react'
import { Milk, Package, IndianRupee } from 'lucide-react'
import MilkTab     from './MilkTab'
import ProductsTab from './ProductsTab'
import ExpensesTab from './ExpensesTab'

type Tab = 'milk' | 'products' | 'expenses'

const TABS: { key: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key:         'milk',
    label:       'Milk Entries',
    icon:        <Milk size={16} />,
    description: 'Morning & evening shifts',
  },
  {
    key:         'products',
    label:       'Products',
    icon:        <Package size={16} />,
    description: 'Stock, pricing, categories',
  },
  {
    key:         'expenses',
    label:       'Expenses',
    icon:        <IndianRupee size={16} />,
    description: 'Daily costs & making price',
  },
]

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('milk')

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage milk entries, product stock, and daily expenses
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-slate-100 pb-0">
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all -mb-px',
                active
                  ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className={active ? 'text-blue-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Active tab description */}
      <p className="text-xs text-slate-400 -mt-2">
        {TABS.find(t => t.key === activeTab)?.description}
      </p>

      {/* Tab content */}
      <div>
        {activeTab === 'milk'     && <MilkTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </div>
    </div>
  )
}

export default Inventory