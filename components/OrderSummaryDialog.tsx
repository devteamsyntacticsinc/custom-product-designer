"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Size } from "@/types/product";
import { useToast } from "@/contexts/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import axios, { AxiosError } from "axios";

interface OrderSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  productType: string;
  brand: string;
  color: string;
  is_onlyType?: boolean;
  sizeSelection: { size: number; quantity: number }[];
  assets: Record<string, File | null>;
  contactInformation: {
    fullName: string;
    email: string;
    contactNumber: string;
    address: string;
  };
}

export default function OrderSummaryDialog({
  isOpen,
  onClose,
  onBack,
  onSubmit,
  productType,
  brand,
  color,
  is_onlyType,
  sizeSelection,
  assets,
  contactInformation,
}: OrderSummaryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addToast } = useToast();

  const [sizes, setSizes] = useState<Size[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchSizes = async () => {
      try {
        const response = await axios.get("/api/sizes");
        if (!response.data) {
          throw new Error("Failed to fetch sizes");
        }
        const data = response.data;
        setSizes(Array.isArray(data) ? data : []);
      } catch (error) {
        const axiosError = error as AxiosError<{
          error?: string;
          message?: string;
        }>;

        const message =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to fetch sizes";
        console.error("Failed to fetch sizes:", message);
      }
    };
    fetchSizes();
  }, []);

  const getSizeName = (sizeId: number): string => {
    const size = sizes.find((s) => s.id === sizeId);
    return size?.value || sizeId.toString();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
      addToast("success", "Order submitted successfully!");
    } catch (error) {
      addToast("error", "Failed to submit order. Please try again.");
      console.error("Error submitting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const getAssetList = () => {
    return Object.entries(assets)
      .filter(([, file]) => file !== null)
      .map(([key, file]) => {
        const placementMap: Record<string, string> = {
          "front-top-left": "Front - Top Left",
          "front-center": "Front - Center",
          "back-top": "Back - Top",
          "back-bottom": "Back - Bottom",
        };

        return {
          id: key,
          name: file?.name || "Unknown file",
          placement: placementMap[key] || key,
        };
      });
  };

  const getTotalItems = () => {
    return sizeSelection.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl">
        {/* Fixed Header */}
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="text-xl font-semibold">
            Order Details
          </DialogTitle>
          <DialogDescription>
            Review your order details before submitting.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium ">Product Details</h3>

            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Product Type:</Label>
                <p className="font-medium">{productType}</p>
              </div>
              {!is_onlyType && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Brand:</Label>
                    <p className="font-medium">{brand}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Shirt color:
                    </Label>
                    <p className="font-medium">{color}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sizing and Quantity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium ">Sizing and Quantity</h3>

            <div className="space-y-2">
              {sizeSelection
                .filter((item) => item.quantity > 0)
                .map((item) => (
                  <div key={item.size} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getSizeName(item.size)}:
                    </span>
                    <span className="font-medium">{item.quantity}pcs</span>
                  </div>
                ))}
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              Total Items:{" "}
              <span className="font-medium">{getTotalItems()}</span>
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium ">Assets</h3>

            <div className="space-y-2">
              {getAssetList().map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2v6a2 2 0 012 2h10a2 2 0 012-2v-6a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {asset.name}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {asset.placement}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium ">Contact Information</h3>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Full Name:</Label>
                <p className="font-medium">{contactInformation.fullName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email:</Label>
                <p className="font-medium">{contactInformation.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Number:</Label>
                <p className="font-medium">
                  {contactInformation.contactNumber}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Address:</Label>
                <p className="font-medium">{contactInformation.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-11"
            disabled={isLoading}
          >
            Back to editing
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
