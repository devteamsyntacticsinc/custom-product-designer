"use client";

import { useRef } from "react";
import { Info, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAssets } from "@/contexts/AssetsContext";

type AssetSlot = {
  id: string;
  label: string;
  side: "Front" | "Back";
};

const ASSET_SLOTS: AssetSlot[] = [
  { id: "front-top-left", label: "Top Left", side: "Front" },
  { id: "front-center", label: "Center", side: "Front" },
  { id: "back-top", label: "Back Top", side: "Back" },
  { id: "back-bottom", label: "Back Bottom", side: "Back" },
];

export default function AssetUpload({
  assets,
  setAssets,
}: {
  assets: Record<string, File | null>;
  setAssets: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
}) {
  const { selectedProductType } = useAssets();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isHasBack = selectedProductType
    ? (selectedProductType.image_products?.find(() => true) ?? false)
    : undefined;

  const is_onlyType = selectedProductType?.is_onlyType;

  const handleFileChange = (slotId: string, file: File | null) => {
    setAssets((prev) => ({ ...prev, [slotId]: file }));
  };

  const removeAsset = (slotId: string) => {
    setAssets((prev) => ({ ...prev, [slotId]: null }));
    if (fileInputRefs.current[slotId]) {
      fileInputRefs.current[slotId]!.value = "";
    }
  };

  const renderSlot = (slot: AssetSlot) => {
    const asset = assets[slot.id];
    const isDisabled = is_onlyType && slot.id !== "front-center";

    if (isDisabled) return null;

    return (
      <div key={slot.id} className="mb-2">
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isDisabled}
          id={slot.id}
          ref={(el) => {
            fileInputRefs.current[slot.id] = el;
          }}
          onChange={(e) =>
            handleFileChange(slot.id, e.target.files?.[0] || null)
          }
        />
        <div
          className={`group flex items-center justify-between p-3 rounded-xl border bg-gray-50/50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors cursor-pointer min-w-0 ${
            asset ? "bg-background border-gray-200 dark:border-gray-600" : ""
          }`}
          onClick={() => !asset && fileInputRefs.current[slot.id]?.click()}
        >
          <span
            className={`text-sm truncate mr-2 ${asset ? " font-medium" : "text-gray-600 dark:text-gray-400"}`}
          >
            {asset
              ? asset.name
              : !isHasBack && slot.id === "front-center"
                ? "Center"
                : slot.label}
          </span>
          {asset ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAsset(slot.id);
              }}
              className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Upload className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
          )}
        </div>
      </div>
    );
  };

  const sides: ("Front" | "Back")[] = !isHasBack
    ? ["Front"]
    : ["Front", "Back"];

  return (
    <div className="space-y-6">
      {isHasBack === undefined ? (
        <div className="font-medium text-xs text-amber-600 flex">
          <Info className="w-4 h-4 mr-1" />
          <span>Please select a product type to attach images </span>
        </div>
      ) : (
        sides.map((side) => (
          <div key={side}>
            <h4 className="text-sm font-semibold  mb-3">{side}</h4>
            <div className="space-y-2">
              {ASSET_SLOTS.filter((slot) => slot.side === side).map(renderSlot)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
