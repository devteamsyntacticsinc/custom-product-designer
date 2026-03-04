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
import axios, { AxiosError } from "axios";

export default function ColorsTab({
  setRefetchColor,
}: {
  setRefetchColor: (refetchColor: number) => void;
}) {
  const [colors, setColors] = useState<Color[]>([]);
  const [isFetchingColors, setIsFetchingColors] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // fetch all colors using use effect an set state

  const fetchColors = async () => {
    try {
      setError(null);
      setIsFetchingColors(true);

      const response = await axios.get(`/api/colors`);

      if (!response.data) {
        throw new Error("Failed to fetch colors");
      }

      const colors = response.data;
      setColors(colors);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingColors(false);
    }
  };
  useEffect(() => {
    fetchColors();
  }, []);

  const handleSubmitColor = async (payload: Color) => {
    setIsMutating(true);
    try {
      if (payload.id) {
        // UPDATE
        const res = await axios.put(`/api/colors`, {
          ...payload,
          id: payload.id.toString(),
        });

        // Check HTTP status
        if (!res.data) {
          throw new Error("Failed to update color");
        }
        addToast("success", "Color updated successfully");
      } else {
        // SAVE
        const res = await axios.post("/api/colors", {
          ...payload,
        });
        // Check HTTP status
        if (!res.data) {
          throw new Error("Failed to save color");
        }
        addToast("success", "Color saved successfully");
      }

      await fetchColors();
      setRefetchColor(Date.now());
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;

      const message =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to save size";

      addToast("error", message);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 py-4 sm:py-6">
        <div>
          <CardTitle className="text-lg sm:text-2xl">Colors</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage product colors available in your store
          </CardDescription>
        </div>
        <ColorSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitColor}
        >
          <Button
            size="sm"
            className="w-full sm:w-auto h-8 lg:h-10 text-xs lg:text-sm"
          >
            <Plus className="h-4 w-4 mr-2 lg:h-5 lg:w-5" />
            Add Color
          </Button>
        </ColorSheet>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs lg:text-sm">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetchingColors ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`colors-loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-xs lg:text-sm text-destructive p-4"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : colors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No colors found
                  </TableCell>
                </TableRow>
              ) : (
                colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell className="text-xs lg:text-sm text-gray-500">
                      #{color.id}
                    </TableCell>
                    <TableCell className="font-medium text-xs lg:text-sm">
                      {color.value}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={color.is_Active ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0"
                      >
                        {color.is_Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ColorSheet
                          mode="edit"
                          isLoading={isMutating}
                          initialData={color}
                          onSubmit={handleSubmitColor}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isMutating}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </ColorSheet>
                        <DeleteDialog
                          isLoading={isMutating}
                          setIsLoading={setIsMutating}
                          color={color}
                          fetchColors={fetchColors}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={isMutating}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DeleteDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
  initialData?: Color;
  onSubmit: (data: Color) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleInputChange = (value: string) => {
    setName(value);
    // Clear error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Color name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.value ?? "");
      setActive(initialData?.is_Active ?? true);
      setErrors({}); // Reset errors when opening
    } else {
      setName("");
      setActive(true);
      setErrors({}); // Reset errors when closing
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    try {
      await onSubmit({
        id: initialData?.id ?? 0,
        value: name,
        is_Active: active,
      });
      setName("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isEdit = mode === "edit";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="text-xs lg:text-sm">
          <SheetTitle>{isEdit ? "Edit Color" : "Add New Color"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected color."
              : "Add a new color to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color-name" className="text-xs lg:text-sm">
              Color Name
            </Label>
            <Input
              id="color-name"
              value={name}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter color name"
              className={`text-xs lg:text-sm h-8 lg:h-10 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={active}
              onCheckedChange={setActive}
              className="text-xs lg:text-sm"
            />
            <Label className="text-xs lg:text-sm">
              {active ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !!errors.name || !name.trim()}
            className="text-xs lg:text-sm h-8 lg:h-10"
          >
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
  color,
  fetchColors,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  color: Color;
  fetchColors: () => Promise<void>;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteColor = async () => {
    if (!color.id) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(`/api/colors?id=${color.id}`);

      if (!res.data) {
        throw new Error("Failed to delete color");
      }
      await fetchColors();
      addToast("success", "Color deleted successfully");
      setOpen(false);
    } catch (error) {
      console.error(error);
      addToast(
        "error",
        error instanceof Error ? error.message : "Failed to delete color",
      );
      // Close dialog on error as well
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            color &quot;{color.value}&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isLoading}>
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
