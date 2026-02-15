"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

    return (
      <div key={slot.id} className="mb-2">
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          id={slot.id}
          ref={(el) => {
            fileInputRefs.current[slot.id] = el;
          }}
          onChange={(e) => handleFileChange(slot.id, e.target.files?.[0] || null)}
        />
        <div
          className={`group flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer min-w-0 ${asset ? "bg-white border-gray-200" : ""
            }`}
          onClick={() => !asset && fileInputRefs.current[slot.id]?.click()}
        >
          <span className={`text-sm truncate mr-2 ${asset ? "text-gray-900 font-medium" : "text-gray-600"}`}>
            {asset ? asset.name : slot.label}
          </span>
          {asset ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAsset(slot.id);
              }}
              className="p-1 rounded-full hover:bg-red-50 text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Upload className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </div>
    );
  };

  const sides: ("Front" | "Back")[] = ["Front", "Back"];

  return (
    <div className="space-y-6">
      {sides.map((side) => (
        <div key={side}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">{side}</h4>
          <div className="space-y-2">
            {ASSET_SLOTS.filter((slot) => slot.side === side).map(renderSlot)}
          </div>
        </div>
      ))}
    </div>
  );
}
