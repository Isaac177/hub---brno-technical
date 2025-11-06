import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePosts, usePost, useDeletePost } from "../../hooks/usePosts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  ThumbsUp,
  MessageSquare,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import CreatePostDialog from "../../components/blog/CreatePostDialog";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { useNavigate } from "react-router-dom";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "../../components/ui/pagination";

const PostsManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    orderBy: "desc",
    type: "ALL",
    status: "ALL",
  });

  const { data: posts, isLoading, error, refetch } = usePosts(filters);
  const { data: postDetails } = usePost(selectedPost?.id);
  const { mutate: deletePost } = useDeletePost();

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  const handleSort = (direction) => {
    setFilters((prev) => ({ ...prev, orderBy: direction }));
  };

  const handleTypeChange = (value) => {
    setFilters((prev) => ({ ...prev, type: value, page: 1 }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const handleEdit = async (post) => {
    setSelectedPost(post);
    setIsEditing(true);
    setCreateDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsEditing(false);
    setCreateDialogOpen(true);
  };

  const handleClose = () => {
    setCreateDialogOpen(false);
    setSelectedPost(null);
    setIsEditing(false);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <div>{t('blogManagement.posts.loading')}</div>;
  if (error) return <div>{t('blogManagement.posts.error', { message: error.message })}</div>;

  const total = posts?.data?.length || 0;
  const postsData = posts?.data || [];
  const meta = posts?.meta || {};

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('blogManagement.posts.title')}</h1>
        <Button className="bg-primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('blogManagement.posts.newPost')}
        </Button>
      </div>

      <CreatePostDialog
        open={createDialogOpen}
        onClose={handleClose}
        selectedPost={selectedPost}
        isEditing={isEditing}
      />

      <div className="flex gap-4 mb-6">
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('blogManagement.posts.filters.type.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('blogManagement.posts.filters.type.all')}</SelectItem>
            <SelectItem value="NEWS">{t('blogManagement.posts.filters.type.news')}</SelectItem>
            <SelectItem value="EVENT">{t('blogManagement.posts.filters.type.event')}</SelectItem>
            <SelectItem value="DISCUSSION">{t('blogManagement.posts.filters.type.discussion')}</SelectItem>
            <SelectItem value="ANNOUNCEMENT">{t('blogManagement.posts.filters.type.announcement')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('blogManagement.posts.filters.status.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('blogManagement.posts.filters.status.all')}</SelectItem>
            <SelectItem value="DRAFT">{t('blogManagement.posts.filters.status.draft')}</SelectItem>
            <SelectItem value="PUBLISHED">{t('blogManagement.posts.filters.status.published')}</SelectItem>
            <SelectItem value="ARCHIVED">{t('blogManagement.posts.filters.status.archived')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSort("asc")}
            className={filters.orderBy === "asc" ? "bg-primary/10" : ""}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSort("desc")}
            className={filters.orderBy === "desc" ? "bg-primary/10" : ""}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('blogManagement.posts.table.title')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.type')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.status')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.author')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.category')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.published')}</TableHead>
            <TableHead>{t('blogManagement.posts.table.engagement')}</TableHead>
            <TableHead className="text-right">{t('blogManagement.posts.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!postsData?.length ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <p>{t('blogManagement.posts.noPostsFound')}</p>
                  {filters.type !== "ALL" || filters.status !== "ALL" ? (
                    <p className="text-sm">{t('blogManagement.posts.tryAdjustingFilters')}</p>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            postsData?.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10">
                    {post.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : post.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {post.status}
                  </span>
                </TableCell>
                <TableCell>{post.authorName}</TableCell>
                <TableCell>{post.category?.name || "-"}</TableCell>
                <TableCell>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('ru-KZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {post._count?.views || 0}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {post._count?.likes || 0}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post._count?.comments || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/news/${post.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => {
                        setSelectedPost(post);
                        setOpenConfirmModal(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="mt-8">
        {meta?.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              {filters.page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(filters.page - 1)} />
                </PaginationItem>
              )}

              {[...Array(Math.min(5, meta.totalPages))].map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={filters.page === pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {meta.totalPages > 5 && filters.page < meta.totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {filters.page < meta.totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(filters.page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {total ? t('blogManagement.posts.totalPosts', { count: total }) : t('blogManagement.posts.noPostsFound')}
        </div>
      </div>
      {openConfirmModal && <ConfirmDialog
        open={openConfirmModal}
        onOpenChange={setOpenConfirmModal}
        title={t('blogManagement.posts.deleteDialog.title')}
        description={t('blogManagement.posts.deleteDialog.description')}
        onConfirm={() => deletePost(selectedPost?.id)}
        confirmText={t('blogManagement.posts.deleteDialog.confirm')}
        cancelText={t('blogManagement.posts.deleteDialog.cancel')}
        variant="destructive"
      />}
    </div>
  );
};

export default PostsManagement;
