import React, { useState, useCallback } from 'react'
import { Checkbox } from './checkbox'

export function BulkActionWrapper({
    data = [],
    children,
    onBulkAction,
    idField = 'id',
    renderBulkActions
}) {
    const [selectedItems, setSelectedItems] = useState(new Set())

    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedItems(new Set(data.map(item => item[idField])))
        } else {
            setSelectedItems(new Set())
        }
    }, [data, idField])

    const handleSelectItem = useCallback((itemId, checked) => {
        const newSelection = new Set(selectedItems)
        if (checked) {
            newSelection.add(itemId)
        } else {
            newSelection.delete(itemId)
        }
        setSelectedItems(newSelection)
    }, [selectedItems])

    const handleBulkAction = useCallback(async (action) => {
        if (selectedItems.size === 0) return

        try {
            await onBulkAction?.(action, Array.from(selectedItems))
            setSelectedItems(new Set()) // Clear selection after action
        } catch (error) {
            console.error('Bulk action failed:', error)
        }
    }, [selectedItems, onBulkAction])

    const clearSelection = useCallback(() => {
        setSelectedItems(new Set())
    }, [])

    const isAllSelected = data.length > 0 && selectedItems.size === data.length
    const isIndeterminate = selectedItems.size > 0 && selectedItems.size < data.length

    const contextValue = {
        selectedItems,
        handleSelectAll,
        handleSelectItem,
        handleBulkAction,
        clearSelection,
        isAllSelected,
        isIndeterminate,
        selectedCount: selectedItems.size
    }

    return (
        <div className="space-y-4">
            {children(contextValue)}
            {selectedItems.size > 0 && renderBulkActions && (
                <div className="border-t pt-4">
                    {renderBulkActions(contextValue)}
                </div>
            )}
        </div>
    )
}

export function BulkSelectHeader({ isAllSelected, isIndeterminate, onSelectAll }) {
    return (
        <Checkbox
            checked={isAllSelected}
            ref={(el) => {
                if (el) el.indeterminate = isIndeterminate
            }}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
        />
    )
}

export function BulkSelectCell({ itemId, isSelected, onSelectItem }) {
    return (
        <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectItem(itemId, checked)}
            aria-label={`Select item ${itemId}`}
        />
    )
}
