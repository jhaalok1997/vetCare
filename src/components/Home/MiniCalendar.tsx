"use client"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function getMonthMatrix(year: number, monthIndex: number) {
    const firstDay = new Date(year, monthIndex, 1)
    const startDay = firstDay.getDay() // 0-6 (Sun-Sat)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const prevMonthDays = new Date(year, monthIndex, 0).getDate()

    const cells: { date: Date; inCurrentMonth: boolean }[] = []

    // Leading days from previous month
    for (let i = 0; i < startDay; i++) {
        const day = prevMonthDays - startDay + 1 + i
        cells.push({ date: new Date(year, monthIndex - 1, day), inCurrentMonth: false })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, monthIndex, d), inCurrentMonth: true })
    }

    // Trailing days to complete 6 rows of 7
    while (cells.length % 7 !== 0 || cells.length < 42) {
        const last = cells[cells.length - 1].date
        const next = new Date(last)
        next.setDate(last.getDate() + 1)
        cells.push({ date: next, inCurrentMonth: false })
    }

    return cells
}

export default function MiniCalendar() {
    const today = new Date()
    const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

    const cells = useMemo(() => getMonthMatrix(view.year, view.month), [view])

    const monthName = new Date(view.year, view.month, 1).toLocaleString("en-US", { month: "long" })

    function prevMonth() {
        setView((v) => {
            const m = v.month - 1
            return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m }
        })
    }

    function nextMonth() {
        setView((v) => {
            const m = v.month + 1
            return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m }
        })
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Appointments Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={prevMonth} aria-label="Previous month">
                            ←
                        </Button>
                        <div className="text-sm font-medium">{monthName} {view.year}</div>
                        <Button variant="outline" size="sm" onClick={nextMonth} aria-label="Next month">
                            →
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <div key={d} className="font-medium">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {cells.map(({ date, inCurrentMonth }) => {
                            const isToday = date.toDateString() === today.toDateString()
                            return (
                                <div
                                    key={date.toISOString()}
                                    className={
                                        "rounded-md p-2 text-sm border text-center " +
                                        (inCurrentMonth ? "bg-white " : "bg-gray-50 text-gray-400 ") +
                                        (isToday ? "border-emerald-500" : "border-gray-200")
                                    }
                                >
                                    {date.getDate()}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}


