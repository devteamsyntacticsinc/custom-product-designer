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

const brands = [
  { id: 1, name: 'Nike', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Adidas', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Puma', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Under Armour', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'New Balance', status: 'active', createdAt: '2024-01-19' },
]

export default function BrandsTab() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [brandActive, setBrandActive] = useState(false)

  const handleSaveBrand = async () => {
    // TODO: Implement API call to save brand
    console.log('Saving brand...')
    setSheetOpen(false)
  }

  return (
    <Card>
      <CardHeader className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Manage product brands available in your store</CardDescription>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Brand</SheetTitle>
                <SheetDescription>
                  Add a new brand to the system.
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input id="brand-name" placeholder="Enter brand name" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={brandActive}
                      onCheckedChange={setBrandActive}
                    />
                    <Label>{brandActive ? 'Active' : 'Inactive'}</Label>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" onClick={handleSaveBrand}>
                  Save Brand
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
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>
                  <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                    {brand.status}
                  </Badge>
                </TableCell>
                <TableCell>{brand.createdAt}</TableCell>
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
