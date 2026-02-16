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
import { useToast } from "@/contexts/ToastContext";

export default function ColorsTab() {
  const [colors, setColors] = useState<(Color & { is_Active: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const { addToast } = useToast();

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
  }, [shouldRefetch]);

  const handleSubmitColor = async (payload: Color & { is_Active: boolean }) => {
    setIsLoading(true);

    try {
      if (payload.id) {
        // UPDATE
        // await handleUpdateColor(payload);
        addToast("success", "Color updated successfully");
      } else {
        // SAVE
        const res = await fetch("/api/colors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        console.log(data);
        addToast("success", "Color saved successfully");
      }
      setShouldRefetch(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between py-6">
        <div>
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Manage product colors available in your store
          </CardDescription>
        </div>
        <ColorSheet
          mode="create"
          isLoading={isLoading}
          onSubmit={handleSubmitColor}
         >
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </ColorSheet>
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
                    <Skeleton className="h-4 w-20" />
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
                      mode="edit"
                      isLoading={isLoading}
                      initialData={color}
                      onSubmit={handleSubmitColor}
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
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: Color & { is_Active: boolean };
  onSubmit: (data: Color & { is_Active: boolean }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  // Sync data when opening in edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.value);
      setActive(initialData.is_Active);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ id: initialData?.id ?? "", value: name, is_Active: active });
    onOpenChange(false);
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
