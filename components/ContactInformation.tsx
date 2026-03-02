"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import OrderSummaryDialog from "./OrderSummaryDialog";

interface ContactInformationProps {
  onBack: () => void;
  onSubmit: (data: ContactData) => Promise<void>; // Changed to async
  productType: string;
  brand: string;
  color: string;
  is_onlyType?: boolean;
  sizeSelection: {
    size: number;
    quantity: number;
  }[];
  assets: Record<string, File | null>;
  contactData: ContactData;
  setContactData: React.Dispatch<React.SetStateAction<ContactData>>;
}

interface ContactData {
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
}

export default function ContactInformation({
  onBack,
  onSubmit,
  productType,
  brand,
  color,
  is_onlyType,
  sizeSelection,
  assets,
  contactData,
  setContactData,
}: ContactInformationProps) {
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const handleInputChange =
    (field: keyof ContactData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setContactData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = () => {
    setShowOrderSummary(true);
  };

  const handleOrderSummarySubmit = async () => {
    await onSubmit(contactData);
    setShowOrderSummary(false);
  };

  const handleOrderSummaryBack = () => {
    setShowOrderSummary(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <h2 className="hidden lg:block text-2xl font-bold  mb-6">
        Contact Information
      </h2>

      <h2 className="lg:hidden text-xl font-bold  mb-6">Contact Information</h2>

      <div className="flex-1 space-y-6">
        {/* Full Name */}
        <div>
          <Label
            htmlFor="full-name"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Full Name
          </Label>
          <Input
            id="full-name"
            type="text"
            value={contactData.fullName}
            onChange={handleInputChange("fullName")}
            placeholder="Enter your full name"
            className="w-full"
          />
        </div>

        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={contactData.email}
            onChange={handleInputChange("email")}
            placeholder="Enter your email"
            className="w-full"
          />
        </div>

        {/* Contact Number */}
        <div>
          <Label
            htmlFor="contact-number"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Contact Number
          </Label>
          <Input
            id="contact-number"
            type="tel"
            value={contactData.contactNumber}
            onChange={handleInputChange("contactNumber")}
            placeholder="Enter your contact number"
            className="w-full"
          />
        </div>

        {/* Address */}
        <div>
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Address
          </Label>
          <Input
            id="address"
            type="text"
            value={contactData.address}
            onChange={handleInputChange("address")}
            placeholder="Enter your address"
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-6 border-t lg:border-none">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>

      {/* Order Summary Dialog */}
      <OrderSummaryDialog
        isOpen={showOrderSummary}
        onClose={handleOrderSummaryBack}
        onBack={handleOrderSummaryBack}
        onSubmit={handleOrderSummarySubmit}
        productType={productType}
        brand={brand}
        color={color}
        is_onlyType={is_onlyType}
        sizeSelection={sizeSelection}
        assets={assets}
        contactInformation={contactData}
      />
    </div>
  );
}
