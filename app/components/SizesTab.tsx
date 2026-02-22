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
import { Size } from "@/types/product";
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

export default function SizesTab({
  setRefetchSize,
}: {
  setRefetchSize: (refetchSize: number) => void;
}) {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isFetchingSizes, setIsFetchingSizes] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // fetch all sizes using use effect an set state

  const fetchSizes = async () => {
    try {
      setError(null);
      setIsFetchingSizes(true);

      const response = await axios.get(`/api/sizes`);

      if (!response.data) {
        throw new Error("Failed to fetch sizes");
      }

      const sizes = response.data;
      setSizes(sizes);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsFetchingSizes(false);
    }
  };
  useEffect(() => {
    fetchSizes();
  }, []);

  const handleSubmitSize = async (payload: Size) => {
    setIsMutating(true);
    try {
      if (payload.id) {
        // UPDATE
        const res = await axios.put(`/api/sizes`, {
          ...payload,
          id: payload.id.toString(),
        });

        // Check HTTP status
        if (!res.data) {
          throw new Error("Failed to update size");
        }
        addToast("success", "Size updated successfully");
      } else {
        // SAVE
        const res = await axios.post("/api/sizes", payload);
        // Check HTTP status
        if (!res.data) {
          throw new Error("Failed to save size");
        }
        addToast("success", "Size saved successfully");
      }

      await fetchSizes();
      setRefetchSize(Date.now());
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

      console.error(message);
      addToast("error", message);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 py-4 sm:py-6">
        <div>
          <CardTitle className="text-lg lg:text-xl">Sizes</CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            Manage product sizes available in your store
          </CardDescription>
        </div>
        <SizeSheet
          mode="create"
          isLoading={isMutating}
          onSubmit={handleSubmitSize}
        >
          <Button size="sm" className="w-full sm:w-auto text-xs lg:text-sm h-8 lg:h-10">
            <Plus className="h-4 w-4 mr-2" />
            Add Size
          </Button>
        </SizeSheet>
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
              {isFetchingSizes ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`sizes-loading-${index}`}>
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
                  <TableCell colSpan={4} className="text-sm text-red-600 p-4">
                    {error}
                  </TableCell>
                </TableRow>
              ) : sizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No sizes found
                  </TableCell>
                </TableRow>
              ) : (
                sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell className="text-xs lg:text-sm text-gray-500 py-3">#{size.id}</TableCell>
                    <TableCell className="font-medium text-xs lg:text-sm py-3">{size.value}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant={size.is_Active ? "default" : "secondary"} className="text-[10px] px-2 py-0">
                        {size.is_Active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <SizeSheet
                          mode="edit"
                          isLoading={isMutating}
                          initialData={size}
                          onSubmit={handleSubmitSize}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isMutating}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </SizeSheet>
                        <DeleteDialog
                          isLoading={isMutating}
                          setIsLoading={setIsMutating}
                          size={size}
                          fetchSizes={fetchSizes}
                          setRefetchSize={setRefetchSize}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={isMutating}>
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

function SizeSheet({
  children,
  mode,
  initialData,
  onSubmit,
  isLoading,
}: {
  children: React.ReactNode;
  mode: "create" | "edit";
  initialData?: Size;
  onSubmit: (data: Size) => Promise<void>;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [open, onOpenChange] = useState(false);
  const [active, setActive] = useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (nextOpen) {
      setName(initialData?.value ?? "");
      setActive(initialData?.is_Active ?? true);
    } else {
      setName("");
      setActive(true);
    }
  };

  const handleSubmit = async () => {
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
          <SheetTitle>{isEdit ? "Edit Size" : "Add New Size"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the selected size."
              : "Add a new size to the system."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="size-name" className="text-xs lg:text-sm">Size Name</Label>
            <Input
              id="size-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter size name"
              className="text-xs lg:text-sm h-8 lg:h-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={active} onCheckedChange={setActive} className="text-xs lg:text-sm" />
            <Label className="text-xs lg:text-sm">{active ? "Active" : "Inactive"}</Label>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="text-xs lg:text-sm h-8 lg:h-10">
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update Size"
                : "Save Size"}
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
  size,
  fetchSizes,
  setRefetchSize,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  size: Size;
  fetchSizes: () => Promise<void>;
  setRefetchSize: (refetchSize: number) => void;
}) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);

  const handleDeleteSize = async () => {
    if (!size.id) return;

    setIsLoading(true);
    try {
      const res = await axios.delete(`/api/sizes?id=${size.id}`);

      if (!res.data) {
        throw new Error("Failed to delete size");
      }
      await fetchSizes();
      addToast("success", "Size deleted successfully");
      setOpen(false);
      setRefetchSize(Date.now());
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

      console.error(message);
      addToast("error", message);
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
            This action cannot be undone. This will permanently delete your size
            &quot;{size.value}&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isLoading}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="text-background"
            onClick={handleDeleteSize}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
