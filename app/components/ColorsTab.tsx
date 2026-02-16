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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ColorFormData = {
  name: string;
  is_Active: boolean;
};

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
        setError(null);
        setIsLoading(true);
        const response = await fetch("/api/colors");
        if (!response.ok) {
          throw new Error("Failed to fetch colors");
        }

        const colors = await response.json();
        setColors(colors);
      } catch (error) {
        console.log(error);
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchColors();
  }, []);

  const handleSaveColor = async () => {
    try {
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateColor = async () => {
    try {
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
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
          <ColorSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            mode="create"
            isLoading={isLoading}
            onSubmit={handleSaveColor}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </Button>
          </ColorSheet>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`colors-loading-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : (
              colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>{color.id}</TableCell>
                  <TableCell className="font-medium">{color.value}</TableCell>
                  <TableCell>
                    <Badge variant={color.is_Active ? "default" : "secondary"}>
                      {color.is_Active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ColorSheet
                      open={sheetOpen}
                      onOpenChange={setSheetOpen}
                      mode="edit"
                      isLoading={isLoading}
                      onSubmit={() => handleUpdateColor()}
                    >
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </ColorSheet>
                    <DeleteDialog
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    >
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ColorSheet({
  open,
  onOpenChange,
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: ColorFormData;
  onSubmit: (data: ColorFormData) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  // Sync data when opening in edit mode
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setActive(initialData?.is_Active ?? true);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    onSubmit({ name, is_Active: active });
  };

  const isEdit = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Color" : "Add New Color"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected color."
              : "Add a new color to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color-name">Color Name</Label>
            <Input
              id="color-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter color name"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>{active ? "Active" : "Inactive"}</Label>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update Color"
                : "Save Color"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DeleteDialog({
  children,
  isLoading,
  setIsLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}) {
  const handleDeleteColor = async () => {
    try {
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            color.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-background"
            onClick={handleDeleteColor}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
