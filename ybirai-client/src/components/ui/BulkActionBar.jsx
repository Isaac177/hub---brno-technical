import React from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { ChevronDown, X } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu'

export function BulkActionBar({
    selectedCount,
    onClearSelection,
    actions = [],
    isLoading = false
}) {
    if (selectedCount === 0) return null

    return (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
            <div className="flex items-center gap-2">
                <Badge variant="secondary">
                    {selectedCount} selected
                </Badge>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    disabled={isLoading}
                >
                    <X className="h-4 w-4" />
                    Clear selection
                </Button>
            </div>

            {actions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isLoading}>
                            Actions
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {actions.map((action, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => action.onClick()}
                                disabled={action.disabled || isLoading}
                                className={action.variant === 'destructive' ? 'text-destructive' : ''}
                            >
                                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}
