import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardMessage } from "../types";

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getRelativeStatus = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24) {
    return `Today — ${Math.round(diffHours)} hours ago`;
  }

  return `${Math.round(diffDays)} day${Math.round(diffDays) > 1 ? "s" : ""} ago`;
};

const isNewMessage = (value?: string | Date | null) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return now.getTime() - date.getTime() < 24 * 60 * 60 * 1000;
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
  const safeDate = (value?: string | Date | null) => {
    if (!value) return new Date(0);
    return new Date(value);
  };

  const sortedMessages = [...(messages || [])].sort(
    (a, b) =>
      safeDate(b.receivedAt).getTime() - safeDate(a.receivedAt).getTime()
  );

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
        {sortedMessages.length ? (
          sortedMessages.map((message) => (
            <div
              key={message.id}
              className="rounded-lg border p-4 space-y-3 hover:bg-muted/30 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{message.name ?? "Unknown sender"}</p>
                  <p className="text-xs text-muted-foreground">{message.email}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">
                    {formatDateTime(message.receivedAt)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {getRelativeStatus(message.receivedAt)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground border-l-4 pl-2">{message.message}</p>

              <div className="flex gap-2 items-center">
                {isNewMessage(message.receivedAt) && (
                  <Badge className="bg-green-600 hover:bg-green-700">NEW</Badge>
                )}

                <Badge variant="outline" className="text-xs">
                  {message.status ?? "new"}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No messages available right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
