import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Pencil, Trash } from 'lucide-react';

const CategoryManagement = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
      } else {
        await createCategory.mutateAsync(formData);
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('blogManagement.categories.deleteConfirm'))) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        <span className="ml-2">{t('blogManagement.categories.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">{t('blogManagement.categories.error')}</h2>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('blogManagement.categories.title')}</h1>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>
              {t('blogManagement.categories.addCategory')}
            </Button>
          </DialogTrigger>
          <DialogContent className='text-gray-500'>
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? t('blogManagement.categories.editCategory')
                  : t('blogManagement.categories.addCategory')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('blogManagement.categories.form.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">{t('blogManagement.categories.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCategory
                  ? t('blogManagement.categories.form.update')
                  : t('blogManagement.categories.form.create')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('blogManagement.categories.table.name')}</TableHead>
            <TableHead>{t('blogManagement.categories.table.description')}</TableHead>
            <TableHead>{t('blogManagement.categories.table.posts')}</TableHead>
            <TableHead>{t('blogManagement.categories.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>{category._count?.posts || 0}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryManagement;
