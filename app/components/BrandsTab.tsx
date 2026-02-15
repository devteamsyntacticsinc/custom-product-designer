'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2 } from 'lucide-react'

const brands = [
  { id: 1, name: 'Nike', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Adidas', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Puma', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Under Armour', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'New Balance', status: 'active', createdAt: '2024-01-19' },
]

export default function BrandsTab() {
  return (
    <Card>
      <CardHeader className="py-6">
        <CardTitle>Brands</CardTitle>
        <CardDescription>Manage product brands available in your store</CardDescription>
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
