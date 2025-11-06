import React, { useState } from 'react'
import { useCategories, useDeleteCategory } from '../../hooks/useCategories'
import { Loader2, FolderTree, Search, Edit, Trash2, Plus } from 'lucide-react'
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { ScrollArea } from "../../components/ui/scroll-area"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"

export default function CategoriesDashboard() {
  const { data: categories, isLoading, isError, error } = useCategories('course')
  const deleteCategory = useDeleteCategory('course')
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteDialogState, setDeleteDialogState] =  useState({ 
    open: false, 
    categoryId: null, 
    isLoading: false 
  })

  const handleDeleteClick = (categoryId) => {
    setDeleteDialogState({ open: true, categoryId, isLoading: false })
  }

  const handleConfirmDelete = async () => {
    setDeleteDialogState(prev => ({ ...prev, isLoading: true }))
    try {
      await deleteCategory.mutateAsync(deleteDialogState.categoryId)
      setDeleteDialogState({ open: false, categoryId: null, isLoading: false })
    } catch (error) {
      console.error('Failed to delete category:', error)
      setDeleteDialogState(prev => ({ ...prev, isLoading: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">{error.message}</p>
      </div>
    )
  }

  const filteredCategories = categories
    ? categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6" />
            <CardTitle>Categories</CardTitle>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
        <CardDescription>
          Manage course categories and their settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Parent Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      {category.parentCategory ? category.parentCategory.name : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-[800px] h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Add a new category for courses
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(80vh-120px)]">
              <div className="px-6">
                {/* Add CreateCategoryForm component here */}
                <p>Category form will go here</p>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteDialogState.open}
          onOpenChange={(open) => setDeleteDialogState(prev => ({ ...prev, open }))}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          isLoading={deleteDialogState.isLoading}
        />
      </CardContent>
    </Card>
  )
} 