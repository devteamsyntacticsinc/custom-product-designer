"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface ChartAreaInteractiveProps {
    data: any[]
    config: ChartConfig
    types: string[]
}

export function ChartAreaInteractive({
    data,
    config,
    types,
}: ChartAreaInteractiveProps) {
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

    const { keys, dynamicConfig } = React.useMemo(() => {
        const allKeys = Array.from(
            new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'date' && k !== 'name')))
        );

        const newConfig: ChartConfig = {};

        allKeys.forEach((key, index) => {
            newConfig[key] = {
                label: config[key]?.label || key,
                color: COLORS[index % COLORS.length]
            };
        });

        return { keys: allKeys, dynamicConfig: newConfig };
    }, [data, config]);

    return (
        <Card className="pt-0 border-none shadow-none bg-transparent">
            <CardContent className="px-0 pt-4 sm:px-0 sm:pt-6">
                <ChartContainer
                    config={dynamicConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={data}>
                        <defs>
                            {keys.map(key => (
                                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor={dynamicConfig[key].color}
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={dynamicConfig[key].color}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                            tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ payload, label }) => {
                                if (!payload || payload.length === 0) return null;

                                return (
                                    <div className="bg-white border shadow p-2 rounded">
                                        <div className="font-semibold mb-1">
                                            {label
                                                ? new Date(label as string | number).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : ""}
                                        </div>
                                        {payload.map((entry: any) => {
                                            const name = entry.dataKey;
                                            const value = entry.value;
                                            const color = dynamicConfig[name].color;

                                            return (
                                                <div key={name} className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                    <span>{`${dynamicConfig[name].label || name}: ${value}`}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }}
                        />
                        {keys.map(key => (
                            <Area
                                key={key}
                                dataKey={key}
                                type="natural"
                                fill={`url(#fill${key})`}
                                stroke={dynamicConfig[key].color}
                                stackId="a"
                                activeDot={{ r: 6 }}
                            />
                        ))}
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
