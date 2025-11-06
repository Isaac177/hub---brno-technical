import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import ForumSidebar from '../../components/common/ForumSidebar';
import ForumRightSidebar from '../../components/common/ForumRightSidebar';
import ForumPost from './ForumPost';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useCategories } from '../../hooks/useCategories';
import { Loader } from '../../components/ui/loader';
import ForumsHead from '../News/ForumsHead';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

const ForumMain = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const postSlug = searchParams.get('post');
  const currentView = searchParams.get('view') || 'ALL';
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: posts, isLoading } = usePosts({
    type: currentView === 'ALL' ? 'DISCUSSION' : currentView,
    categoryId,
    search,
    page: currentPage,
    limit: 5,
    language: currentLanguage
  });
  const { data: categories } = useCategories();

  const handleNextPage = () => {
    if (posts?.meta && currentPage < posts.meta.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePostClick = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('post', slug);
    navigate(`?${newParams.toString()}`);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <ForumsHead
        title={t('forum.title')}
        description={t('forum.description')}
        image=""
      />
      <div className="container mx-auto px-4 py-6 my-24 space-y-6 lg:flex lg:gap-6">

        <ForumSidebar className="hidden lg:block" />

        <div className="flex-1 space-y-6">
          {postSlug ? (
            <ForumPost />
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center lg:text-left">
                {currentView === 'ALL' ? t('forum.discussions') :
                  categoryId ? categories?.find(c => c.id === categoryId)?.name :
                    currentView.charAt(0) + currentView.slice(1).toLowerCase()}
              </h1>

              {isLoading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                  <Loader size={20} className="my-4 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {posts?.data?.map((post) => (
                      <div
                        key={post.id}
                        className="bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handlePostClick(post.slug)}
                      >
                        {/* Добавлен адаптивный flex для мобильных */}
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h2 className="text-lg font-semibold">{post.title}</h2>
                            <div className="flex flex-wrap gap-2">
                              {categories?.find(cat => cat.id === post.categoryId) && (
                                <Badge variant="outline">
                                  {categories.find(cat => cat.id === post.categoryId).name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-x-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.authorAvatar} />
                              <AvatarFallback>{getInitials(post.authorName || t('forum.post.anonymous'))}</AvatarFallback>
                            </Avatar>
                            <span>{post.authorName || t('forum.post.anonymous')}</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString(currentLanguage === 'kk' ? 'kk-KZ' : currentLanguage === 'ru' ? 'ru-KZ' : 'en-US')}</span>
                          <span>•</span>
                          <span>{post.comments?.length || 0} {t('forum.post.replies')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {posts?.meta && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={handlePreviousPage}
                              disabled={currentPage === 1}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <span className="text-sm">
                              {t('forum.post.page')} {currentPage} {t('forum.post.of')} {posts.meta.totalPages}
                            </span>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              onClick={handleNextPage}
                              disabled={currentPage === posts.meta.totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Скрываем правую панель на мобильных */}
        <ForumRightSidebar className="hidden lg:block" />
      </div>
    </div>
  );
};

export default ForumMain;
