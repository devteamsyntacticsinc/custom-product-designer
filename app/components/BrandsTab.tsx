'use client'

import { useEffect } from 'react'
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
import { Brand } from '@/types/product'
import { useToast } from '@/contexts/ToastContext'



export default function BrandsTab() {
  const { addToast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [brandActive, setBrandActive] = useState(true)
  const [brandName, setBrandName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brands', {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch brands')
      const data = await response.json()
      setBrands(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleSaveBrand = async () => {
    if (!brandName.trim()) return

    try {
      const isEditing = !!editingId
      const url = '/api/brands'
      const method = isEditing ? 'PUT' : 'POST'
      const payload = isEditing
        ? { id: editingId, name: brandName, is_Active: brandActive }
        : { name: brandName, is_Active: brandActive }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'save'} brand`)

      addToast('success', `Brand ${isEditing ? 'updated' : 'saved'} successfully`)
      setBrandName('')
      setBrandActive(true)
      setEditingId(null)
      setSheetOpen(false)
      fetchBrands()
    } catch (err) {
      console.error(err)
      addToast('error', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingId(brand.id)
    setBrandName(brand.name)
    setBrandActive(brand.is_Active)
    setSheetOpen(true)
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return

    try {
      const response = await fetch(`/api/brands?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete brand')
      addToast('success', 'Brand deleted successfully')
      fetchBrands()
    } catch (err) {
      console.error(err)
      addToast('error', err instanceof Error ? err.message : 'Failed to delete brand')
    }
  }


  return (
    <Card>
      <CardHeader className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>Manage product brands available in your store</CardDescription>
          </div>
          <Sheet open={sheetOpen} onOpenChange={(open) => {
            setSheetOpen(open)
            if (!open) {
              setEditingId(null)
              setBrandName('')
              setBrandActive(true)
            }
          }}>
            <SheetTrigger asChild>
              <Button onClick={() => {
                setEditingId(null)
                setBrandName('')
                setBrandActive(true)
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{editingId ? 'Edit Brand' : 'Add New Brand'}</SheetTitle>
                <SheetDescription>
                  {editingId ? 'Update brand details.' : 'Add a new brand to the system.'}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input
                      id="brand-name"
                      placeholder="Enter brand name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
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
                  {editingId ? 'Update Brand' : 'Save Brand'}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading brands...</TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No brands found.</TableCell>
              </TableRow>
            ) : brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-mono text-xs">{brand.id}</TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>
                  <Badge variant={brand.is_Active ? 'default' : 'secondary'}>
                    {brand.is_Active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBrand(brand)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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