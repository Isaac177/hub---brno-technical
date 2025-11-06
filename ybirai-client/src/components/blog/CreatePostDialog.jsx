import React, { useEffect, useState } from 'react';
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogDescription,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ImageUpload } from "../common/ImageUpload";
import { useCategories } from "../../hooks/useCategories";
import { useCreatePost, useUpdatePost } from "../../hooks/usePosts";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

const getPostTypes = (t) => [
  { value: "NEWS", label: t('blog.post.types.news') },
  { value: "EVENT", label: t('blog.post.types.event') },
  { value: "DISCUSSION", label: t('blog.post.types.discussion') },
  { value: "ANNOUNCEMENT", label: t('blog.post.types.announcement') },
];

const getPostStatuses = (t) => [
  { value: "DRAFT", label: t('blog.post.status.draft') },
  { value: "PUBLISHED", label: t('blog.post.status.published') },
];

const getValidationSchema = (t) => Yup.object().shape({
  title: Yup.string()
    .min(3, t('blog.validation.title.min'))
    .max(100, t('blog.validation.title.max'))
    .required(t('blog.validation.title.required')),
  content: Yup.string()
    .min(10, t('blog.validation.content.min'))
    .required(t('blog.validation.content.required')),
  type: Yup.string().required(t('blog.validation.type.required')),
  tags: Yup.string(),
  status: Yup.string().required(t('blog.validation.status.required')),
  categoryId: Yup.string().required(t('blog.validation.category.required')),
  imageUrl: Yup.string().required(t('blog.validation.image.required')),
});

const CreatePostDialog = ({ open, onOpenChange, selectedPost, isEditing, defaultType }) => {
  const { t } = useTranslation();
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useCategories();
  const { mutateAsync: createPost, isLoading: isCreating } = useCreatePost();
  const { mutateAsync: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { user } = useAuth();

  const formik = useFormik({
    initialValues: {
      title: selectedPost?.title || "",
      content: selectedPost?.content || "",
      type: defaultType || selectedPost?.type || "NEWS",
      status: selectedPost?.status || "PUBLISHED",
      categoryId: selectedPost?.categoryId || "",
      imageUrl: selectedPost?.imageUrl || "",
      tags: selectedPost?.tags?.map(tag => tag.name).join(", ") || "",
    },
    validationSchema: getValidationSchema(t),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const postData = {
          ...values,
          tags: values.tags ? values.tags.split(",").map(tag => ({ name: tag.trim() })) : [],
        };

        if (isEditing) {
          await updatePost({ id: selectedPost.id, ...postData });
        } else {
          await createPost(postData);
        }
        resetForm();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to create post:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageUpload = (url) => {
    formik.setFieldValue("imageUrl", url);
  };

  useEffect(() => {
    if (selectedPost && isEditing) {
      formik.setValues({
        title: selectedPost.title || "",
        content: selectedPost.content || "",
        type: selectedPost.type || "",
        status: selectedPost.status || "PUBLISHED",
        categoryId: selectedPost.categoryId || "",
        imageUrl: selectedPost.imageUrl || "",
        tags: selectedPost.tags?.map(tag => tag.name).join(", ") || "",
      });
    } else {
      formik.resetForm();
    }
  }, [selectedPost, isEditing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="!max-w-5xl max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {isEditing ? t('blog.dialog.edit.title') : t('blog.dialog.create.title')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isEditing ? t('blog.dialog.edit.description') : t('blog.dialog.create.description')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <form onSubmit={formik.handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-foreground">{t('blog.form.title.label')}</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-background text-foreground placeholder:text-muted-foreground"
                    placeholder={t('blog.form.title.placeholder')}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <span className="text-destructive text-sm">{formik.errors.title}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags" className="text-foreground">{t('blog.form.tags.label')}</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder={t('blog.form.tags.placeholder')}
                    value={formik.values.tags}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  {formik.touched.tags && formik.errors.tags && (
                    <span className="text-destructive text-sm">{formik.errors.tags}</span>
                  )}
                </div>

                {!defaultType && (
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-foreground">{t('blog.form.type.label')}</Label>
                    <Select
                      name="type"
                      value={formik.values.type}
                      onValueChange={(value) => formik.setFieldValue("type", value)}
                    >
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder={t('blog.form.type.placeholder')} className="text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {getPostTypes(t).map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="text-foreground hover:bg-muted"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="categoryId" className="text-foreground">{t('blog.form.category.label')}</Label>
                  <Select
                    value={formik.values.categoryId}
                    onValueChange={(value) =>
                      formik.setFieldValue("categoryId", value)
                    }
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue
                        placeholder={
                          loadingCategories
                            ? t('blog.form.category.loading')
                            : categoriesError
                              ? t('blog.form.category.error')
                              : t('blog.form.category.placeholder')
                        }
                        className="text-muted-foreground"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled className="text-muted-foreground">
                          {t('blog.form.category.loading')}
                        </SelectItem>
                      ) : categoriesError ? (
                        <SelectItem value="error" disabled className="text-destructive">
                          {t('blog.form.category.error')}
                        </SelectItem>
                      ) : categories?.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="text-foreground hover:bg-muted"
                          >
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled className="text-muted-foreground">
                          {t('blog.form.category.none')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {formik.touched.categoryId && formik.errors.categoryId && (
                    <span className="text-destructive text-sm">
                      {formik.errors.categoryId}
                    </span>
                  )}
                  {categoriesError && (
                    <span className="text-destructive text-sm">
                      {t('blog.form.category.error.message')}
                    </span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-foreground">{t('blog.form.status.label')}</Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(value) => formik.setFieldValue("status", value)}
                  >
                    <SelectTrigger className="bg-background text-foreground">
                      <SelectValue placeholder={t('blog.form.status.placeholder')} className="text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {getPostStatuses(t).map((status) => (
                        <SelectItem
                          key={status.value}
                          value={status.value}
                          className="text-foreground hover:bg-muted"
                        >
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <span className="text-destructive text-sm">{formik.errors.status}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="imageUrl" className="text-foreground">{t('blog.form.image.label')}</Label>
                  <div className="mt-1">
                    <ImageUpload
                      value={formik.values.imageUrl}
                      onChange={(url) => {
                        formik.setFieldValue("imageUrl", url);
                        formik.setFieldTouched("imageUrl", true);
                      }}
                    />
                  </div>
                  {formik.touched.imageUrl && formik.errors.imageUrl && (
                    <span className="text-destructive text-sm">{formik.errors.imageUrl}</span>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content" className="text-foreground">{t('blog.form.content.label')}</Label>
                  {formik.values.type === "NEWS" ? (
                    <ReactQuill
                      value={formik.values.content}
                      onChange={(value) => formik.setFieldValue("content", value)}
                      className="bg-background text-foreground [&_.ql-editor]:text-foreground [&_.ql-toolbar]:bg-background [&_.ql-toolbar]:border-border [&_.ql-container]:bg-background [&_.ql-container]:border-border"
                      theme="snow"
                    />
                  ) : (
                    <Textarea
                      className="w-full min-h-[200px] p-2 rounded-md bg-background text-foreground border border-border placeholder:text-muted-foreground resize-none"
                      placeholder={t('blog.form.content.placeholder')}
                      {...formik.getFieldProps("content")}
                    />
                  )}
                  {formik.touched.content && formik.errors.content && (
                    <span className="text-destructive text-sm">{formik.errors.content}</span>
                  )}
                </div>
              </div>
            </form>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              onClick={formik.handleSubmit}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? t('blog.form.updating') : t('blog.form.creating')}
                </>
              ) : (
                <>{isEditing ? t('blog.form.update') : t('blog.form.create')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CreatePostDialog;
