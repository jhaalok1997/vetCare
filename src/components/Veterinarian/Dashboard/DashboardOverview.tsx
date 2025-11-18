import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Calendar, Users, MessageSquare } from "lucide-react";
import {DashboardOverview} from "./types";

  

const numberFormatter = new Intl.NumberFormat();

type DashboardOverviewProps = {
    overview?: DashboardOverview;
};

export function DashboardOverviewSection({ overview }: DashboardOverviewProps) {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <PawPrint className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numberFormatter.format(overview?.totalPatients ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Todays Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numberFormatter.format(overview?.todaysAppointments ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">New Consultations</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numberFormatter.format(overview?.newConsultations ?? 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {numberFormatter.format(overview?.unreadMessages ?? 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        {numberFormatter.format(overview?.todaysAppointments ?? 0)} appointment(s) scheduled
                        for today.
                    </p>
                    <p>
                        Monitoring {numberFormatter.format(overview?.newConsultations ?? 0)} new consultations
                        in the past week.
                    </p>
                    <p>
                        {numberFormatter.format(overview?.unreadMessages ?? 0)} message(s) awaiting review.
                    </p>
                </CardContent>
            </Card>
        </>
    );
}


