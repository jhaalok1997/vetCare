import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardAppointment } from "./types";

const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "N/A";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

type DashboardAppointmentsProps = {
    appointments?: DashboardAppointment[];
    isLoading?: boolean;
};

export function DashboardAppointmentsSection({
    appointments,
    isLoading,
}: DashboardAppointmentsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && <p className="text-sm text-muted-foreground">Refreshing appointment data…</p>}
                {appointments?.length ? (
                    appointments.map((appointment) => (
                        <div key={appointment.id} className="rounded-lg border p-4 flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold">{appointment.patientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.species ?? "Species not provided"}
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatDateTime(appointment.scheduledFor)}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span>{appointment.condition ?? "General consultation"}</span>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs font-medium">
                                    {appointment.urgency ?? "Low"}
                                </span>
                                <span>Status: {appointment.status ?? "scheduled"}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No appointments available from the API yet.</p>
                )}
            </CardContent>
        </Card>
    );
}


