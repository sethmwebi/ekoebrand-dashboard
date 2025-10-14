import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerSchema,
  type CustomerFormData,
} from "~/schemas/customer-schema";
import type { Customer } from "~/routes/customers";

interface CustomerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null; // Allow customer to be null
}

async function checkEmailExists(
  email: string,
  currentEmail?: string
): Promise<boolean> {
  if (currentEmail && email === currentEmail) return false;

  try {
    const response = await fetch(
      "http://localhost:8000/v1/api/users/check-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return (await response.json()).exists;
  } catch (error) {
    console.error("Email check failed:", error);
    throw new Error("Failed to verify email");
  }
}

export function CustomerEditDialog({
  open,
  onOpenChange,
  customer,
}: CustomerEditDialogProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      mobileNumber: customer?.mobileNumber ?? "",
      street: customer?.address?.street ?? "",
      city: customer?.address?.city ?? "",
      county: customer?.address?.county ?? "",
      postalCode: customer?.address?.postalCode ?? "",
      country: customer?.address?.country ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!customer) throw new Error("No customer data provided");

      if (data.email !== customer.email) {
        const emailExists = await checkEmailExists(data.email);
        if (emailExists) throw new Error("Email already in use");
      }

      const response = await fetch(
        `http://localhost:8000/v1/api/users/${customer.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            mobileNumber: data.mobileNumber,
            address: {
              street: data.street,
              city: data.city,
              county: data.county,
              postalCode: data.postalCode,
              country: data.country,
            },
          }),
        }
      );

      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update customer"
        );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onOpenChange(false);
      toast.success("Customer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = handleSubmit((data) => updateMutation.mutate(data));

  if (!customer) {
    return null; // or render an error message
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Phone Number</Label>
            <Input id="mobileNumber" {...register("mobileNumber")} />
            {errors.mobileNumber && (
              <p className="text-sm text-destructive">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-6">
            <Label className="text-lg font-semibold">Address</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" {...register("street")} />
                {errors.street && (
                  <p className="text-sm text-destructive">
                    {errors.street.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input id="county" {...register("county")} />
                {errors.county && (
                  <p className="text-sm text-destructive">
                    {errors.county.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
                {errors.country && (
                  <p className="text-sm text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
