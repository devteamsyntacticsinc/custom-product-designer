"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus } from "lucide-react";
import { Color } from "@/types/product";

export default function ColorsTab() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [colorActive, setColorActive] = useState(false);
  const [colors, setColors] = useState<(Color & { is_Active: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch all colors using use effect an set state

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setIsLoading(true);
        const colors = await fetch("/api/colors").then((res) => res.json());
        setColors(colors);
      } catch (error) {
        console.log(error);
        setError(error as string);
      } finally {
        setIsLoading(false);
      }
    };
    fetchColors();
  }, []);

  const handleSaveColor = async () => {
    // TODO: Implement API call to save color
    console.log("Saving color...");
    setSheetOpen(false);
  };

  return (
    <Card>
      <CardHeader className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Colors</CardTitle>
            <CardDescription>
              Manage product colors available in your store
            </CardDescription>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Color
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Color</SheetTitle>
                <SheetDescription>
                  Add a new color to the system.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-name">Color Name</Label>
                    <Input id="color-name" placeholder="Enter color name" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={colorActive}
                      onCheckedChange={setColorActive}
                    />
                    <Label>{colorActive ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" onClick={handleSaveColor}>
                  Save Color
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.map((color) => (
              <TableRow key={color.id}>
                <TableCell>{color.id}</TableCell>
                <TableCell className="font-medium">{color.value}</TableCell>
                <TableCell>
                  <Badge variant={color.is_Active ? "default" : "secondary"}>
                    {color.is_Active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
