import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Avatar } from "@mui/material";
import { Mail, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string | null;
    email: string;
    mobileNumber: string | null;
    image: string | null;
    role: string;
    createdAt: string;
    address: {
      street: string;
      city: string;
      county: string;
      postalCode: string;
      country: string;
      pickupLocation: string | null;
    };
    _count: {
      orders: number;
    };
  };
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="!text-xl">Customer Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] w-full pr-4">
          <div className="grid gap-6">
            <div className="flex items-start gap-6">
              <Avatar
                src={customer.image || undefined}
                alt={customer.name || "Customer"}
                sx={{
                  width: 80,
                  height: 80,
                }}
                className="!bg-foreground-muted"
              >
                {customer.name?.charAt(0) || customer.email.charAt(0)}
              </Avatar>

              <div className="flex-1 grid gap-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    {customer.name || customer.email.split("@")[0]}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="  text-primary font-semibold text-lg">
                        Email
                      </div>
                      <div className="font-medium">{customer.email}</div>
                    </div>
                  </div>

                  {customer.mobileNumber && (
                    <div className="flex items-center gap-3">
                      <Phone
                        size={18}
                        className="text-primary font-semibold text-lg"
                      />
                      <div>
                        <div className="  text-primary font-semibold text-lg">
                          Phone
                        </div>
                        <div className="font-medium">
                          {customer.mobileNumber}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-y-2 ml-2 flex-col">
                    <div className="  text-primary font-semibold text-lg">
                      Orders
                    </div>
                    <div className="font-medium">{customer._count.orders}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <div className="  text-primary font-semibold text-lg">
                        Joined
                      </div>
                      <div className="font-medium">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {customer?.address && (
              <div className="border-t pt-4">
                <h4 className="flex text-xl font-bold items-center gap-2 mb-3">
                  <MapPin
                    size={20}
                    className="text-primary text-lg font-bold"
                  />
                  Shipping Address
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-primary font-semibold text-lg">
                      Street
                    </div>
                    <div className="font-medium">{customer.address.street}</div>
                  </div>
                  <div>
                    <div className="text-primary font-semibold text-lg">
                      City
                    </div>
                    <div className="font-medium">{customer.address.city}</div>
                  </div>
                  <div>
                    <div className="text-primary font-semibold text-lg">
                      County
                    </div>
                    <div className="font-medium">{customer.address.county}</div>
                  </div>
                  <div>
                    <div className="text-primary font-semibold text-lg">
                      Postal Code
                    </div>
                    <div className="font-medium">
                      {customer.address.postalCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-primary font-semibold text-lg">
                      Country
                    </div>
                    <div className="font-medium">
                      {customer.address.country}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
