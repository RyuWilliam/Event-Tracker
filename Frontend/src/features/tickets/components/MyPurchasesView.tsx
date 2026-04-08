import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardTitle, Button, Badge } from "@/shared/ui";
import {
  QrCode,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
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
  const navigate = useNavigate();
  const { getTicketResumes, loading, error } = useTicketPurchase();
  const [purchases, setPurchases] = useState<TicketResume[]>([]);
  const [eventsData, setEventsData] = useState<Record<string, Event>>({});
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<SelectedPurchaseWithId | null>(null);

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
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
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
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center p-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 opacity-50" />
            <p>No tickets purchased yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">My Tickets</h2>
        </div>
        <Button
          onClick={loadPurchases}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {purchases.map((purchase, index) => {
          const eventInfo = eventsData[purchase.eventName];
          const imageObjUrl = eventInfo
            ? getImageUrl(eventInfo.imageUrl)
            : null;

          return (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-md transition-shadow h-full"
            >
              <div className="flex flex-col sm:flex-row h-full">
                {/* Event Image */}
                <div className="w-full sm:w-1/3 bg-muted relative shrink-0 h-32 sm:h-auto min-h-[140px]">
                  {imageObjUrl ? (
                    <img
                      src={imageObjUrl}
                      alt={purchase.eventName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Ticket Content */}
                <div className="p-4 flex flex-1 flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {purchase.type.name}
                      </Badge>
                      <h3
                        className="text-xl font-semibold line-clamp-1"
                        title={purchase.eventName}
                      >
                        {purchase.eventName}
                      </h3>
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
                            {purchase.quantity}
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

                  <div className="mt-4 pt-4 border-t border-border mt-auto">
                    <Button
                      onClick={() => handleShowQr(purchase, index)}
                      variant="default"
                      className="w-full gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

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
          ticketType={selectedPurchase.type.name}
          eventName={selectedPurchase.eventName}
          onOpenChange={setQrDialogOpen}
        />
      )}
    </div>
  );
}
