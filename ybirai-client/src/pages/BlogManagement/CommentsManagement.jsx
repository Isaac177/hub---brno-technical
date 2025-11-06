import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAllComments, useDeleteComment, useBlockComment } from '../../hooks/useComments';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Loader, Trash, Ban, Eye, ThumbsUp } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { toast } from 'sonner';

const format = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ru-KZ', options);
};

export default function CommentsManagement() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error, isFetching } = useAllComments({ page, limit });
  const deleteComment = useDeleteComment();
  const blockComment = useBlockComment();

  const handleDelete = async (id) => {
    if (window.confirm(t('blogManagement.comments.confirmDelete'))) {
      try {
        await deleteComment.mutateAsync(id);
        toast.success(t('blogManagement.comments.deleteSuccess'));
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error(t('blogManagement.comments.deleteError'));
      }
    }
  };

  const handleBlock = async (id) => {
    try {
      await blockComment.mutateAsync(id);
      toast.success(t('blogManagement.comments.statusUpdateSuccess'));
    } catch (error) {
      console.error('Error blocking comment:', error);
      toast.error(t('blogManagement.comments.statusUpdateError'));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('blogManagement.comments.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">{t('blogManagement.comments.error')}</h2>
        <p className="text-gray-600 mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  // Safely access data properties with defaults
  const comments = data?.comments ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('blogManagement.comments.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('blogManagement.comments.subtitle')}
          </p>
        </div>
        {isFetching && (
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{t('blogManagement.comments.refreshing')}</span>
          </div>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-600">{t('blogManagement.comments.noComments')}</h2>
          <p className="text-gray-600 mt-2">{t('blogManagement.comments.noCommentsDescription')}</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('blogManagement.comments.table.author')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.content')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.post')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.likes')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.date')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.status')}</TableHead>
                  <TableHead>{t('blogManagement.comments.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>{comment.authorName || 'Unknown'}</TableCell>
                    <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                    <TableCell>
                      {comment.post && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/news/${comment.post.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('blogManagement.comments.actions.view')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {comment._count?.likes || 0}
                      </div>
                    </TableCell>
                    <TableCell>{format(comment.createdAt)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${comment.isBlocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {comment.isBlocked
                          ? t('blogManagement.comments.status.blocked')
                          : t('blogManagement.comments.status.active')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlock(comment.id)}
                        >
                          <Ban className={`h-4 w-4 ${comment.isBlocked ? 'text-green-600' : 'text-red-600'}`} />
                          <span className="sr-only">
                            {comment.isBlocked
                              ? t('blogManagement.comments.actions.unblock')
                              : t('blogManagement.comments.actions.block')}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                          <span className="sr-only">{t('blogManagement.comments.actions.delete')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
