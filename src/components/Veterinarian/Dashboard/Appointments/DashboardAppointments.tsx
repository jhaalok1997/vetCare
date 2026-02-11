import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardAppointment } from "../types";

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
  isVerified?: boolean;
  onConfirm?: (appointmentId: string) => void;
};

export function DashboardAppointmentsSection({
  appointments,
  isLoading,
  isVerified,
  onConfirm,
}: DashboardAppointmentsProps) {
  const pendingAppointments = (appointments || []).filter(
    (appointment) => appointment.status === "pending"
  );
  const otherAppointments = (appointments || []).filter(
    (appointment) => appointment.status !== "pending"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Refreshing appointment data...
          </p>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            New Booking Requests
          </h4>
          {!isVerified && (
            <p className="text-xs text-red-600">
              Verification required to view and confirm new booking requests.
            </p>
          )}
          {isVerified && pendingAppointments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No new booking requests right now.
            </p>
          )}
          {isVerified &&
            pendingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg border p-4 flex flex-col gap-2"
              >
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
                  <span>Status: {appointment.status ?? "pending"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" onClick={() => onConfirm?.(appointment.id)}>
                    Confirm Appointment
                  </Button>
                </div>
              </div>
            ))}
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Upcoming Appointments
          </h4>
          {otherAppointments.length ? (
            otherAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg border p-4 flex flex-col gap-2"
              >
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
            <p className="text-sm text-muted-foreground">
              No upcoming appointments available yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
