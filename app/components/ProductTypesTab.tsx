'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2, Plus } from 'lucide-react'

const productTypes = [
  { id: 1, name: 'T-Shirt', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Hoodie',status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Mug', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Cap', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'Phone Case', status: 'active', createdAt: '2024-01-19' },
]

export default function ProductTypesTab() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [productTypeActive, setProductTypeActive] = useState(false)

  const handleSaveProductType = async () => {
    // TODO: Implement API call to save product type
    console.log('Saving product type...')
    setSheetOpen(false)
  }

  return (
    <Card>
      <CardHeader className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Types</CardTitle>
            <CardDescription>Manage different types of products available in your store</CardDescription>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product Type
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Product Type</SheetTitle>
                <SheetDescription>
                  Add a new product type to the system.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type-name">Product Type Name</Label>
                    <Input id="product-type-name" placeholder="Enter product type name" />
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
                <Button type="submit" onClick={handleSaveProductType}>
                  Save Product Type
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
            {productTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell>{type.id}</TableCell>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <Badge variant={type.status === 'active' ? 'default' : 'secondary'}>
                    {type.status}
                  </Badge>
                </TableCell>
                <TableCell>{type.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
