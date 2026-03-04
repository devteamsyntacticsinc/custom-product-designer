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
  const [errors, setErrors] = useState<Partial<ContactData>>({});

  const handleInputChange =
    (field: keyof ContactData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setContactData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactData> = {};

    if (!contactData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!contactData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!contactData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (
      !/^\d+$/.test(contactData.contactNumber.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.contactNumber = "Contact number must contain only digits";
    }

    if (!contactData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowOrderSummary(true);
    }
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
            className={`w-full ${errors.fullName ? "border-red-500" : ""}`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
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
            className={`w-full ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
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
            className={`w-full ${errors.contactNumber ? "border-red-500" : ""}`}
          />
          {errors.contactNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
          )}
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
            className={`w-full ${errors.address ? "border-red-500" : ""}`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-6 border-t lg:border-none">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
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
