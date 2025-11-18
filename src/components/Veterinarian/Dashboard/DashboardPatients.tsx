import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardPatient } from "./types";

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

type DashboardPatientsProps = {
  patients?: DashboardPatient[];
};

export function DashboardPatientsSection({ patients }: DashboardPatientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patients?.length ? (
          patients.map((patient) => (
            <div key={patient.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex flex-wrap items-baseline gap-2 justify-between">
                <div>
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.species ?? "Species not provided"}
                    {patient.age !== undefined ? ` • ${patient.age} yrs` : ""}
                    {patient.breed ? ` • ${patient.breed}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  Last visit: {formatDateTime(patient.lastVisit)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Condition: {patient.condition ?? "General check-up"}</p>
                <p>Urgency: {patient.urgency ?? "Low"}</p>
              </div>
              {patient.latestDiagnosisSnippet && (
                <p className="text-sm italic text-muted-foreground">
                  “{patient.latestDiagnosisSnippet}…”
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Patient summaries will appear once matches are recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}


