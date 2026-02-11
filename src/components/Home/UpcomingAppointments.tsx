"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type VetProfileLite = {
    name?: string
    contact?: {
        email?: string
    }
}

type AppointmentListItem = {
    _id?: string
    id?: string
    patientName?: string
    species?: string
    scheduledFor?: string | Date
    status?: string
    veterinarian?: VetProfileLite
}

const formatDateTime = (value?: string | Date) => {
    if (!value) return "N/A"
    const date = typeof value === "string" ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date)
}

const toInputDateTime = (value?: string | Date) => {
    if (!value) return ""
    const date = typeof value === "string" ? new Date(value) : value
    if (Number.isNaN(date.getTime())) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getVetLabel(vet?: VetProfileLite) {
    if (!vet) return "Assigned vet"
    return vet.name || vet.contact?.email || "Assigned vet"
}

export default function UpcomingAppointments() {
    const [appointments, setAppointments] = useState<AppointmentListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingValue, setEditingValue] = useState<string>("")
    const [actionLoading, setActionLoading] = useState(false)

    const loadAppointments = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get("/api/veterinarian/dashboard/appointments", {
                params: { mine: "true", status: "pending,confirmed,cancelled", limit: "8" },
            })
            const items = Array.isArray(res.data?.data) ? res.data.data : []
            setAppointments(items)
        } catch (err) {
            console.error("Failed to load appointments:", err)
            setError("Unable to load appointments right now.")
        } finally {
            setLoading(false)
        }
    }

    const startReschedule = (appointment: AppointmentListItem) => {
        const id = appointment.id || appointment._id || ""
        if (!id) return
        setEditingId(id)
        setEditingValue(toInputDateTime(appointment.scheduledFor))
    }

    const cancelReschedule = () => {
        setEditingId(null)
        setEditingValue("")
    }

    const submitReschedule = async () => {
        if (!editingId || !editingValue) return
        setActionLoading(true)
        try {
            await axios.patch("/api/veterinarian/dashboard/appointments", {
                appointmentId: editingId,
                scheduledFor: editingValue,
            })
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("appointments:updated"))
            }
            await loadAppointments()
            cancelReschedule()
        } catch (err) {
            console.error("Failed to reschedule appointment:", err)
            if (typeof window !== "undefined") {
                window.alert("Unable to reschedule appointment. Please try again.")
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancel = async (appointmentId: string) => {
        if (!appointmentId) return
        const confirmed = typeof window !== "undefined" ? window.confirm("Cancel this appointment?") : false
        if (!confirmed) return
        setActionLoading(true)
        try {
            await axios.patch("/api/veterinarian/dashboard/appointments", { appointmentId, status: "cancelled" })
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("appointments:updated"))
            }
            await loadAppointments()
        } catch (err) {
            console.error("Failed to cancel appointment:", err)
            if (typeof window !== "undefined") {
                window.alert("Unable to cancel appointment. Please try again.")
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (appointmentId: string) => {
        if (!appointmentId) return
        const confirmed = typeof window !== "undefined"
            ? window.confirm("Delete this appointment permanently?")
            : false
        if (!confirmed) return
        setActionLoading(true)
        try {
            await axios.delete("/api/veterinarian/dashboard/appointments", { params: { appointmentId } })
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("appointments:updated"))
            }
            await loadAppointments()
        } catch (err) {
            console.error("Failed to delete appointment:", err)
            if (typeof window !== "undefined") {
                window.alert("Unable to delete appointment. Please try again.")
            }
        } finally {
            setActionLoading(false)
        }
    }

    useEffect(() => {
        loadAppointments()
        const handler = () => loadAppointments()
        window.addEventListener("appointments:updated", handler)
        return () => window.removeEventListener("appointments:updated", handler)

    }, [])

    const sortedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            const aTime = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0
            const bTime = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0
            return aTime - bTime
        })
    }, [appointments])

    return (
        <section className="max-w-7xl mx-auto px-6 pb-12">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="text-xl">Your Upcoming Appointments</CardTitle>
                    <Button variant="outline" size="sm" onClick={loadAppointments} disabled={loading}>
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading && <p className="text-sm text-muted-foreground">Loading appointments...</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {!loading && !error && !sortedAppointments.length && (
                        <p className="text-sm text-muted-foreground">No upcoming appointments yet.</p>
                    )}
                    {sortedAppointments.map((appointment) => {
                        const id = appointment.id || appointment._id || ""
                        const status = appointment.status || "pending"
                        const isConfirmed = status === "confirmed"
                        const isPending = status === "pending"
                        const isCancelled = status === "cancelled"
                        const statusLabel = isConfirmed
                            ? "Confirmed"
                            : isCancelled
                                ? "Cancelled"
                                : "Pending Confirmation"
                        const isEditing = editingId === id
                        return (
                            <div key={id} className="rounded-lg border p-4 flex flex-col gap-2">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">{appointment.patientName || "Unnamed patient"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {appointment.species ?? "Species not provided"}
                                        </p>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDateTime(appointment.scheduledFor)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span
                                        className={
                                            "rounded-full px-3 py-1 text-xs font-semibold " +
                                            (isConfirmed
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : isCancelled
                                                    ? "bg-gray-100 text-gray-700 border border-gray-200"
                                                    : "bg-amber-50 text-amber-700 border border-amber-200")
                                        }
                                    >
                                        {statusLabel}
                                    </span>
                                    {isConfirmed && (
                                        <span className="text-muted-foreground">
                                            Vet: {getVetLabel(appointment.veterinarian)}
                                        </span>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            New Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="w-full rounded-md border px-3 py-2 text-sm"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            <Button size="sm" onClick={submitReschedule} disabled={actionLoading || !editingValue}>
                                                Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={cancelReschedule} disabled={actionLoading}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {!isEditing && isPending && (
                                        <Button size="sm" variant="outline" onClick={() => startReschedule(appointment)} disabled={actionLoading}>
                                            Edit / Reschedule
                                        </Button>
                                    )}
                                    <Button size="sm" variant="destructive" onClick={() => handleCancel(id)} disabled={actionLoading || isCancelled}>
                                        {isCancelled ? "Cancelled" : "Cancel"}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(id)} disabled={actionLoading}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </section>
    )
}
