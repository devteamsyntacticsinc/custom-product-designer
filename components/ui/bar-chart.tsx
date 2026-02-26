"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface ChartBarInteractiveProps {
    data: any[]
    config: ChartConfig
    dataKey: string
    labelKey: string
}

export function ChartBarInteractive({
    data,
    config,
    dataKey,
    labelKey
}: ChartBarInteractiveProps) {
    return (
        <div className="w-full">
            <ChartContainer config={config} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={data}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey={labelKey}
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar
                        dataKey={dataKey}
                        fill={config[dataKey]?.color || config[dataKey]?.theme?.light || "#3b82f6"}
                        radius={8}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    )
}
