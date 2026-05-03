import { useState, useEffect } from "react";
import { Card, Button, Badge } from "@/shared/ui";
import {
  QrCode,
  AlertCircle,
  Ticket,
  MapPin,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTicketPurchase } from "../hooks/useTicketPurchase";
import { QrDialog } from "./QrDialog";
import type { TicketResume } from "../types/ticket.types";
import { getEvents } from "@/features/events/services/eventsApi";
import type { Event } from "@/features/events/types/event.types";
import { resolveImageUrl } from "@/lib/image";

function getImageUrl(imageUrl: string | null | undefined): string | null {
  return resolveImageUrl(imageUrl);
}

interface SelectedPurchaseWithId extends TicketResume {
  displayId: number;
}

export function MyPurchasesView() {
  const { getTicketResumes, loading, error } = useTicketPurchase();
  const [purchases, setPurchases] = useState<TicketResume[]>([]);
  const [eventsData, setEventsData] = useState<Record<string, Event>>({});
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"ACTIVE" | "HISTORICAL">("ACTIVE");
  const [selectedPurchase, setSelectedPurchase] =
    useState<SelectedPurchaseWithId | null>(null);

  const [selectedEventName, setSelectedEventName] = useState<string | null>(null);

  const loadPurchases = async () => {
    try {
      const [resumes, eventsList] = await Promise.all([
        getTicketResumes(),
        getEvents().catch(() => [] as Event[]),
      ]);

      const eventsMap: Record<string, Event> = {};
      for (const ev of eventsList) {
        eventsMap[ev.name] = ev;
      }

      setPurchases(resumes);
      setEventsData(eventsMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load purchases";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleShowQr = (purchase: TicketResume, index: number) => {
    setSelectedPurchase({
      ...purchase,
      displayId: purchase.id || index,
    });
    setQrDialogOpen(true);
  };

  if (loading && purchases.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-12">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading your purchases...
          </div>
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>No tickets purchased yet</p>
          </div>
        </div>
      </div>
    );
  }

  const activePurchases = purchases.filter((purchase) => {
    const eventInfo = eventsData[purchase.eventName];
    // Consider it active if event details not found yet or status is ACTIVE or CANCELLED
    return !eventInfo || eventInfo.status === "ACTIVE" || !eventInfo.status || eventInfo.status === "CANCELLED";
  });

  const historicalPurchases = purchases.filter((purchase) => {
    const eventInfo = eventsData[purchase.eventName];
    return eventInfo && eventInfo.status === "FINISHED";
  });

  const displayedPurchases = viewMode === "ACTIVE" ? activePurchases : historicalPurchases;

  // Group purchases by event name
  const groupedPurchases = displayedPurchases.reduce((acc, purchase) => {
    const eventName = purchase.eventName;
    if (!acc[eventName]) {
      acc[eventName] = {
        eventName,
        purchases: [],
        totalQuantity: 0,
        totalAmount: 0,
      };
    }
    acc[eventName].purchases.push(purchase);
    acc[eventName].totalQuantity += purchase.totalQuantity || 0;
    acc[eventName].totalAmount += purchase.total || 0;
    return acc;
  }, {} as Record<string, { eventName: string; purchases: TicketResume[]; totalQuantity: number; totalAmount: number }>);

  const groupedList = Object.values(groupedPurchases);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">
              {selectedEventName ? (
                <div className="flex items-center cursor-pointer hover:underline text-muted-foreground transition-colors" onClick={() => setSelectedEventName(null)}>
                  Back
                </div>
              ) : "My Tickets"}
            </h2>
          </div>
        </div>
        
        {!selectedEventName && (
          <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
            <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setViewMode("ACTIVE")}
                className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "ACTIVE" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setViewMode("HISTORICAL")}
                className={`flex-1 sm:px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "HISTORICAL" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Historical
              </button>
            </div>
          </div>
        )}
      </div>

      {!selectedEventName ? (
        groupedList.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-card rounded-lg border border-border mt-4">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
              <p>
                {viewMode === "ACTIVE" 
                  ? "No current events found." 
                  : "No historical events found."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {groupedList.map((group, index) => {
              const eventInfo = eventsData[group.eventName];
              const imageObjUrl = eventInfo ? getImageUrl(eventInfo.imageUrl) : null;

              return (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer"
                  onClick={() => setSelectedEventName(group.eventName)}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-1/3 bg-muted relative shrink-0 h-32 sm:h-auto min-h-[140px]">
                      {imageObjUrl ? (
                        <img src={imageObjUrl} alt={group.eventName} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          {eventInfo?.status === "CANCELLED" && (
                            <Badge variant="destructive" className="mb-2 bg-red-500 hover:bg-red-600">
                              Cancelled
                            </Badge>
                          )}
                          <h3 className="text-xl font-semibold line-clamp-2" title={group.eventName}>
                            {group.eventName}
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 shrink-0 text-foreground" />
                            <span>Total Tickets: <span className="font-medium text-foreground">{group.totalQuantity}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{group.purchases.length} Purchases</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Purchases for {selectedEventName}</h3>
          {groupedPurchases[selectedEventName]?.purchases.length === 0 ? (
            <div className="flex items-center justify-center p-12 bg-card rounded-lg border border-border">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
                <p>No purchases found for this event.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groupedPurchases[selectedEventName]?.purchases.map((purchase, index) => {
                const eventInfo = eventsData[purchase.eventName];
                
                return (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="p-4 flex flex-1 flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {purchase.items?.map((item, i) => (
                              <Badge key={i} variant="secondary">
                                {item.type.name}: {item.quantity}
                              </Badge>
                            ))}
                            {eventInfo?.status === "CANCELLED" && (
                              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                                Cancelled
                              </Badge>
                            )}
                            {eventInfo?.status === "FINISHED" && (
                              <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">
                                Finished
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 shrink-0 text-foreground" />
                            <span className="font-medium text-foreground">
                              ${purchase.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 shrink-0 text-foreground" />
                            <span>
                              Quantity:{" "}
                              <span className="font-medium text-foreground">
                                {purchase.totalQuantity}
                              </span>
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="flex items-center gap-2 text-xs">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              Address
                            </span>
                            <span
                              className="text-xs break-all text-foreground bg-muted p-1.5 rounded line-clamp-2"
                              title={purchase.userAddress}
                            >
                              {purchase.userAddress}
                            </span>
                          </div>
                        </div>
                      </div>

                      {eventInfo?.status !== "CANCELLED" && eventInfo?.status !== "FINISHED" && (
                        <div className="mt-4 pt-4 border-t border-border mt-auto">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowQr(purchase, index);
                            }}
                            variant="default"
                            className="w-full gap-2"
                          >
                            <QrCode className="h-4 w-4" />
                            Show QR
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedPurchase && (
        <QrDialog
          open={qrDialogOpen}
          purchaseId={selectedPurchase.displayId}
          ticketType={selectedPurchase.items?.map(i => `${i.type.name}: ${i.quantity}`).join(" | ") || "General"}
          eventName={selectedPurchase.eventName}
          onOpenChange={setQrDialogOpen}
        />
      )}
    </div>
  );
}
