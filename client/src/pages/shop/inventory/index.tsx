import React, { useState } from 'react'
import { Tabs } from '../../../components/ui/Tabs'
import MilkTab     from './MilkTab'
import ProductsTab from './ProductsTab'
import ExpensesTab from './ExpensesTab'

const TABS = [
  { key: 'milk',     label: '🥛 Milk Entries' },
  { key: 'products', label: '📦 Products'     },
  { key: 'expenses', label: '💰 Expenses'     },
]

const Inventory: React.FC = () => {
  const [tab, setTab] = useState('milk')
  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Inventory</h2>
        <p className="text-sm text-slate-400 mt-0.5">Milk, products and daily expenses</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'milk'     && <MilkTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'expenses' && <ExpensesTab />}
    </div>
  )
}

export default Inventory