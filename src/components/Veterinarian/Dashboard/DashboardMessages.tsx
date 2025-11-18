import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {DashboardMessage} from "./types"



const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "N/A";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

type DashboardMessagesProps = {
    messages?: DashboardMessage[];
    isLoading?: boolean;
    onRefresh?: () => void;
};

export function DashboardMessagesSection({
    messages,
    isLoading,
    onRefresh,
}: DashboardMessagesProps) {
    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Messages</CardTitle>
                {onRefresh && (
                    <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                        Refresh
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {messages?.length ? (
                    messages.map((message) => (
                        <div key={message.id} className="rounded-lg border p-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold">{message.name ?? "Unknown sender"}</p>
                                    <p className="text-xs text-muted-foreground">{message.email}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {formatDateTime(message.receivedAt)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{message.message}</p>
                            <p className="text-xs text-muted-foreground">
                                Status: {message.status ?? "new"}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No messages available right now.</p>
                )}
            </CardContent>
        </Card>
    );
}


