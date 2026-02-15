"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import OrderSummaryDialog from "./OrderSummaryDialog";

interface ContactInformationProps {
  onBack: () => void;
  onSubmit: (data: ContactData) => void;
  productType: string;
  brand: string;
  color: string;
  sizeSelection: {
    size: string;
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
  sizeSelection,
  assets,
  contactData,
  setContactData
}: ContactInformationProps) {
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const handleInputChange = (field: keyof ContactData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = () => {
    setShowOrderSummary(true);
  };

  const handleOrderSummarySubmit = () => {
    onSubmit(contactData);
    setShowOrderSummary(false);
  };

  const handleOrderSummaryBack = () => {
    setShowOrderSummary(false);
  };

  return (
    <>
      {/* Contact Form */}
      <div className="w-80 bg-white shadow-lg p-6 overflow-y-auto flex flex-col min-h-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Contact Information
        </h2>

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
        <div className="flex gap-3 mt-auto pt-6">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button className="flex-1 bg-gray-800 hover:bg-gray-900" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
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
        sizeSelection={sizeSelection}
        assets={assets}
        contactInformation={contactData}
      />
    </>
  );
}
