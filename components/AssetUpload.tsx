"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AssetUpload() {
  return (
    <Tabs defaultValue="front" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="front">Front</TabsTrigger>
        <TabsTrigger value="back">Back</TabsTrigger>
      </TabsList>
      <TabsContent value="front" className="mt-2">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Input type="file" accept="image/*" className="hidden" id="front-asset" />
          <label htmlFor="front-asset" className="cursor-pointer">
            <div className="text-gray-500 text-sm">Click to upload front design</div>
          </label>
        </div>
      </TabsContent>
      <TabsContent value="back" className="mt-2">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Input type="file" accept="image/*" className="hidden" id="back-asset" />
          <label htmlFor="back-asset" className="cursor-pointer">
            <div className="text-gray-500 text-sm">Click to upload back design</div>
          </label>
        </div>
      </TabsContent>
    </Tabs>
  );
}
