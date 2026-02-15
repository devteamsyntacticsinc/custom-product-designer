'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2 } from 'lucide-react'

const productTypes = [
  { id: 1, name: 'T-Shirt', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'Hoodie',status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Mug', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Cap', status: 'inactive', createdAt: '2024-01-18' },
  { id: 5, name: 'Phone Case', status: 'active', createdAt: '2024-01-19' },
]

export default function ProductTypesTab() {
  return (
    <Card>
      <CardHeader className="py-6">
        <CardTitle>Product Types</CardTitle>
        <CardDescription>Manage different types of products available in your store</CardDescription>
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
