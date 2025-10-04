import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { AvailableReceptionItem } from '../../services/updService'

interface UPDItemsHierarchyProps {
  items: AvailableReceptionItem[]
  selectedItemIds: Set<string>
  onToggleItem: (itemId: string) => void
  onToggleAll: () => void
}

interface CollapsibleHeaderProps {
  isExpanded: boolean
  toggle: () => void
  children: React.ReactNode
  className?: string
}

const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  isExpanded,
  toggle,
  children,
  className = '',
}) => (
  <div
    onClick={toggle}
    className={`flex items-center justify-between cursor-pointer transition-all duration-150 ${className}`}
  >
    {children}
    <button className="text-slate-600 hover:text-blue-600 flex-shrink-0 transition-colors ml-2">
      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
    </button>
  </div>
)

interface ItemRowProps {
  item: AvailableReceptionItem
  isSelected: boolean
  onToggle: () => void
}

const ItemRow: React.FC<ItemRowProps> = ({ item, isSelected, onToggle }) => {
  const totalAmount = item.price * item.quantity

  return (
    <div
      className={`flex items-center py-2 px-3 rounded transition-colors ${
        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="rounded border-slate-300 text-blue-600 mr-3 flex-shrink-0"
      />
      <div className="flex-grow min-w-0">
        <p className="text-sm text-slate-900">{item.item_description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
          <span>Кол-во: {item.quantity}</span>
          <span>Цена: {item.price.toLocaleString('ru-RU')} ₽</span>
          <span className="font-medium">Сумма: {totalAmount.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    </div>
  )
}

interface TransactionGroupProps {
  type: string
  items: AvailableReceptionItem[]
  selectedItemIds: Set<string>
  onToggleItem: (itemId: string) => void
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  type,
  items,
  selectedItemIds,
  onToggleItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  const isIncome = type === 'Приход'
  const bgColor = isIncome ? 'bg-green-50' : 'bg-red-50'
  const textColor = isIncome ? 'text-green-800' : 'text-red-800'
  const borderColor = isIncome ? 'border-green-200' : 'border-red-200'

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const selectedCount = items.filter(item => selectedItemIds.has(item.id)).length

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className={`py-2 px-3 ${bgColor}`}
      >
        <h5 className={`text-sm font-medium ${textColor} flex-grow`}>
          {type}
        </h5>
        <div className="flex items-center gap-3 text-sm">
          <span className={textColor}>
            {selectedCount}/{items.length} выбрано
          </span>
          <span className={`font-semibold ${textColor}`}>
            {totalAmount.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </CollapsibleHeader>

      {isExpanded && (
        <div className="bg-white p-2 space-y-1">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={selectedItemIds.has(item.id)}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: AvailableReceptionItem[]
  selectedItemIds: Set<string>
  onToggleItem: (itemId: string) => void
}

const WorkGroup: React.FC<WorkGroupProps> = ({
  workGroup,
  items,
  selectedItemIds,
  onToggleItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter((item) => item.transaction_type === 'Приход')
  const expenseItems = items.filter((item) => item.transaction_type === 'Расход')

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const selectedCount = items.filter(item => selectedItemIds.has(item.id)).length

  return (
    <div className="border-l-4 border-blue-400 pl-3">
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="py-2 px-2 hover:bg-blue-50 rounded"
      >
        <h4 className="text-sm font-medium text-slate-800 flex-grow">
          {workGroup}
        </h4>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{selectedCount}/{items.length}</span>
          <span className="font-semibold">{totalAmount.toLocaleString('ru-RU')} ₽</span>
        </div>
      </CollapsibleHeader>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-3">
          <TransactionGroup
            type="Приход"
            items={incomeItems}
            selectedItemIds={selectedItemIds}
            onToggleItem={onToggleItem}
          />
          <TransactionGroup
            type="Расход"
            items={expenseItems}
            selectedItemIds={selectedItemIds}
            onToggleItem={onToggleItem}
          />
        </div>
      )}
    </div>
  )
}

interface MotorGroupProps {
  motorInfo: {
    inventory_number: string
    service_description: string
    subdivision: string | null
    reception_number: string
    reception_date: string
  }
  items: AvailableReceptionItem[]
  selectedItemIds: Set<string>
  onToggleItem: (itemId: string) => void
}

const MotorGroup: React.FC<MotorGroupProps> = ({
  motorInfo,
  items,
  selectedItemIds,
  onToggleItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const workGroupMap = new Map<string, AvailableReceptionItem[]>()
  items.forEach((item) => {
    if (!workGroupMap.has(item.work_group)) {
      workGroupMap.set(item.work_group, [])
    }
    workGroupMap.get(item.work_group)!.push(item)
  })

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const selectedCount = items.filter(item => selectedItemIds.has(item.id)).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <CollapsibleHeader
        isExpanded={isExpanded}
        toggle={() => setIsExpanded(!isExpanded)}
        className="p-4 bg-slate-50 hover:bg-slate-100"
      >
        <div className="flex-grow min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                М
              </span>
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-base font-semibold text-slate-900">
                {motorInfo.service_description}
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                <span>Инв. №: {motorInfo.inventory_number}</span>
                {motorInfo.subdivision && <span>Подразделение: {motorInfo.subdivision}</span>}
                <span>Приемка: {motorInfo.reception_number}</span>
                <span>{new Date(motorInfo.reception_date).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4">
          <span className="text-sm text-slate-600">
            {selectedCount}/{items.length} работ
          </span>
          <span className="text-base font-semibold text-slate-900">
            {totalAmount.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </CollapsibleHeader>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup
              key={workGroup}
              workGroup={workGroup}
              items={workItems}
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const UPDItemsHierarchy: React.FC<UPDItemsHierarchyProps> = ({
  items,
  selectedItemIds,
  onToggleItem,
  onToggleAll,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        Нет доступных позиций для выбранных фильтров
      </div>
    )
  }

  const motorGroups = new Map<string, AvailableReceptionItem[]>()
  items.forEach((item) => {
    const key = `${item.motor_inventory_number}|${item.reception_number}`
    if (!motorGroups.has(key)) {
      motorGroups.set(key, [])
    }
    motorGroups.get(key)!.push(item)
  })

  const allSelected = items.length > 0 && selectedItemIds.size === items.length
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < items.length
  const totalSelectedAmount = items
    .filter(item => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someSelected
              }
            }}
            onChange={onToggleAll}
            className="rounded border-slate-300 text-blue-600"
          />
          <span className="text-sm font-medium text-slate-700">
            {selectedItemIds.size === 0
              ? 'Выбрать все'
              : `Выбрано: ${selectedItemIds.size} из ${items.length}`}
          </span>
        </div>
        {selectedItemIds.size > 0 && (
          <div className="text-right">
            <p className="text-sm text-slate-600">Сумма выбранных позиций:</p>
            <p className="text-lg font-bold text-slate-900">
              {totalSelectedAmount.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}
      </div>

      {Array.from(motorGroups.entries()).map(([key, motorItems]) => {
        const firstItem = motorItems[0]
        return (
          <MotorGroup
            key={key}
            motorInfo={{
              inventory_number: firstItem.motor_inventory_number,
              service_description: firstItem.motor_service_description,
              subdivision: firstItem.subdivision_name,
              reception_number: firstItem.reception_number,
              reception_date: firstItem.reception_date,
            }}
            items={motorItems}
            selectedItemIds={selectedItemIds}
            onToggleItem={onToggleItem}
          />
        )
      })}
    </div>
  )
}
