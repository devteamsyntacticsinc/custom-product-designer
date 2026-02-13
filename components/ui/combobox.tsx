import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    loading?: boolean
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    disabled = false,
    className,
    loading = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedOption = options.find((option) => option.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled || loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            Loading...
                        </span>
                    ) : selectedOption ? (
                        selectedOption.label
                    ) : (
                        placeholder
                    )}
                    <ChevronDown className={cn(
                        "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
                        open && "rotate-180"
                    )} />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 border border-gray-200 shadow-md"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
            >
                <Command className="w-full">
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={`item-${option.value}`}
                                    onSelect={() => {
                                        onValueChange?.(option.value === value ? "" : option.value)
                                        setOpen(false)
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
