"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Size } from "@/types/product";
import { useToast } from "@/contexts/ToastContext";

interface OrderSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: () => Promise<void>; // Changed to async
  productType: string;
  brand: string;
  color: string;
  sizeSelection: { size: string; quantity: number }[];
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
  sizeSelection,
  assets,
  contactInformation,
}: OrderSummaryDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { addToast } = useToast();

  const [sizes, setSizes] = React.useState<Size[]>([]);

  React.useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await fetch("/api/sizes");
        const data = await response.json();
        setSizes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
      }
    };
    fetchSizes();
  }, []);

  const getSizeName = (sizeId: string): string => {
    const size = sizes.find(s => s.id === sizeId);
    return size?.value || sizeId;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
      addToast("success", "Order submitted successfully!");
      // Don't close dialog here - let parent handle it
    } catch (error) {
      addToast("error", "Failed to submit order. Please try again.");
      console.error("Error submitting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getAssetList = () => {
    return Object.entries(assets)
      .filter(([, file]) => file !== null)
      .map(([key, file]) => {
        // Map to readable placement names
        const placementMap: Record<string, string> = {
          "front-top-left": "Front - Top Left",
          "front-center": "Front - Center", 
          "back-top": "Back - Top",
          "back-bottom": "Back - Bottom"
        };
        
        return {
          id: key,
          name: file?.name || "Unknown file",
          placement: placementMap[key] || key
        };
      });
  };

  const getTotalItems = () => {
    return sizeSelection.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Brand:</Label>
                <p className="font-medium">{brand}</p>
              </div>
              <div>
                <Label className="text-gray-600">Shirt color:</Label>
                <p className="font-medium">{color}</p>
              </div>
            </div>
          </div>

          {/* Sizing and Quantity */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Sizing and Quantity</h3>
            
            <div className="space-y-2">
              {sizeSelection
                .filter(item => item.quantity > 0)
                .map(item => (
                  <div key={item.size} className="flex justify-between text-sm">
                    <span className="text-gray-600">{getSizeName(item.size)}:</span>
                    <span className="font-medium">{item.quantity}pcs</span>
                  </div>
                ))}
            </div>
            
            <div className="pt-2 text-sm text-gray-600">
              Total Items: <span className="font-medium">{getTotalItems()}</span>
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Assets</h3>
            
            <div className="space-y-2">
              {getAssetList().map(asset => (
                <div key={asset.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2v6a2 2 0 012 2h10a2 2 0 012-2v-6a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-700">{asset.name}</span>
                      <div className="text-xs text-gray-500">{asset.placement}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <Label className="text-gray-600">Full Name:</Label>
                <p className="font-medium">{contactInformation.fullName}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email:</Label>
                <p className="font-medium">{contactInformation.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Number:</Label>
                <p className="font-medium">{contactInformation.contactNumber}</p>
              </div>
              <div>
                <Label className="text-gray-600">Address:</Label>
                <p className="font-medium">{contactInformation.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
            Back to editing
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-gray-800 hover:bg-gray-900" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
