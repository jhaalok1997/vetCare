"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

type DataPoint = { label: string; value: number }

export default function MiniChart({
    title = "Pet Health Overview",
    data = [
        { label: "Mon", value: 12 },
        { label: "Tue", value: 18 },
        { label: "Wed", value: 9 },
        { label: "Thu", value: 16 },
        { label: "Fri", value: 22 },
        { label: "Sat", value: 14 },
        { label: "Sun", value: 19 },
    ],
}: {
    title?: string
    data?: DataPoint[]
}) {
    const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data])
    const height = 140
    const width = 320
    const barGap = 10
    const barWidth = (width - barGap * (data.length + 1)) / data.length

    return (
        <section className="w-25rem mx-auto px-6 py-10">
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2">
                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            width="100%"
                            height={height}
                            className="rounded-md bg-gradient-to-b from-white to-gray-50"
                        >
                            {data.map((d, i) => {
                                const h = Math.round((d.value / max) * (height - 24))
                                const x = barGap + i * (barWidth + barGap)
                                const y = height - h
                                return (
                                    <g key={d.label}>
                                        <rect
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={h}
                                            rx={6}
                                            className="fill-emerald-500/80"
                                        />
                                        <text
                                            x={x + barWidth / 2}
                                            y={height - 4}
                                            textAnchor="middle"
                                            fontSize="10"
                                            className="fill-gray-500"
                                        >
                                            {d.label}
                                        </text>
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}


