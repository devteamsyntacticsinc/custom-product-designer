'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import { ProductService } from '@/lib/api/product'
import { ProductType } from '@/types/product'

interface ProductTypeWithMeta extends ProductType {
  is_Active?: boolean
  created_at?: string
}

export default function ProductTypesTab() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [productTypeActive, setProductTypeActive] = useState(true)
  const [productTypeName, setProductTypeName] = useState('')
  const [editingProductType, setEditingProductType] = useState<ProductTypeWithMeta | null>(null)
  const [productTypes, setProductTypes] = useState<ProductTypeWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProductTypes()
  }, [])

  const fetchProductTypes = async () => {
    try {
      setIsLoading(true)
      const data = await ProductService.getProductTypes()
      setProductTypes(data as ProductTypeWithMeta[])
    } catch (error) {
      console.error('Error fetching product types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProductType = async () => {
    if (!productTypeName.trim()) return

    try {
      setIsSaving(true)
      if (editingProductType) {
        await ProductService.updateProductType(editingProductType.id, productTypeName, productTypeActive)
      } else {
        await ProductService.createProductType(productTypeName, productTypeActive)
      }
      await fetchProductTypes()
      resetForm()
      setSheetOpen(false)
    } catch (error) {
      console.error('Error saving product type:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setProductTypeName('')
    setProductTypeActive(true)
    setEditingProductType(null)
  }

  const handleEditClick = (type: ProductTypeWithMeta) => {
    setEditingProductType(type)
    setProductTypeName(type.name)
    setProductTypeActive(type.is_Active !== false)
    setSheetOpen(true)
  }

  const handleDeleteProductType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product type?')) return

    try {
      await ProductService.deleteProductType(id)
      await fetchProductTypes()
    } catch (error) {
      console.error('Error deleting product type:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Types</CardTitle>
            <CardDescription>Manage different types of products available in your store</CardDescription>
          </div>
          <Sheet open={sheetOpen} onOpenChange={(open) => {
            if (!open) resetForm()
            setSheetOpen(open)
          }}>
            <SheetTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product Type
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingProductType ? 'Edit Product Type' : 'Add New Product Type'}</SheetTitle>
                <SheetDescription>
                  {editingProductType ? 'Update the product type details.' : 'Add a new product type to the system.'}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type-name">Product Type Name</Label>
                    <Input
                      id="product-type-name"
                      placeholder="Enter product type name"
                      value={productTypeName}
                      onChange={(e) => setProductTypeName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={productTypeActive}
                      onCheckedChange={setProductTypeActive}
                    />
                    <Label>{productTypeActive ? 'Active' : 'Inactive'}</Label>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" onClick={handleSaveProductType} disabled={isSaving || !productTypeName.trim()}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProductType ? 'Update Product Type' : 'Save Product Type'}
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
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading product types...</p>
                </TableCell>
              </TableRow>
            ) : productTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No product types found.
                </TableCell>
              </TableRow>
            ) : (
              productTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.id}</TableCell>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>
                    <Badge variant={type.is_Active !== false ? 'default' : 'secondary'}>
                      {type.is_Active !== false ? 'active' : 'inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{type.created_at ? new Date(type.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProductType(type.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
