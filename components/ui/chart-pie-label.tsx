"use client"

import React, { useMemo } from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
    Card,
    CardContent,
} from "@/components/ui/card"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface BrandPieProps {
    data: { date: string;[key: string]: string | number }[]
    types: string[]
}

export function ChartPieLabel({ data, types }: BrandPieProps) {
    const baseColor = [59, 130, 246]; // [R, G, B]

    // Suppose `types` is your array of items you want colors for
    const COLORS = types.map((_, index) => {
        // Calculate factor from dark to light
        const factor = 0.4 + (index / types.length) * 0.6;
        const r = Math.floor(baseColor[0] * factor);
        const g = Math.floor(baseColor[1] * factor);
        const b = Math.floor(baseColor[2] * factor);
        return `rgb(${r}, ${g}, ${b})`;
    });
    const chartData = useMemo(() => {
        const totals: Record<string, number> = {}

        data.forEach(entry => {
            types.forEach(type => {
                const value = entry[type]
                if (typeof value === "number") {
                    totals[type] = (totals[type] || 0) + value
                }
            })
        })

        return Object.entries(totals).map(([name, value]) => ({
            name,
            value,
        }))
    }, [data, types])

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {}

        types.forEach((type, index) => {
            config[type] = {
                label: type,
                color: COLORS[index % COLORS.length],
            }
        })

        return config
    }, [types])

    return (
        <Card className="flex flex-col">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full aspect-square max-h-[350px]"
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value }) => `${name}: ${value}`}
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}