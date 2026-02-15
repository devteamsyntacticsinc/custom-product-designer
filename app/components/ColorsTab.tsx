'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2 } from 'lucide-react'

const colors = [
  { id: 1, name: 'Black', status: 'active', createdAt: '2024-01-15' },
  { id: 2, name: 'White', status: 'active', createdAt: '2024-01-16' },
  { id: 3, name: 'Red', status: 'active', createdAt: '2024-01-17' },
  { id: 4, name: 'Blue', status: 'active', createdAt: '2024-01-18' },
  { id: 5, name: 'Green', status: 'inactive', createdAt: '2024-01-19' },
  { id: 6, name: 'Yellow', status: 'active', createdAt: '2024-01-20' },
]

export default function ColorsTab() {
  return (
    <Card>
      <CardHeader className="py-6">
        <CardTitle>Colors</CardTitle>
        <CardDescription>Manage product colors available in your store</CardDescription>
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
            {colors.map((color) => (
              <TableRow key={color.id}>
                <TableCell>{color.id}</TableCell>
                <TableCell className="font-medium">{color.name}</TableCell>
                <TableCell>
                  <Badge variant={color.status === 'active' ? 'default' : 'secondary'}>
                    {color.status}
                  </Badge>
                </TableCell>
                <TableCell>{color.createdAt}</TableCell>
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
