import React, { useState } from 'react';
import { useNewsPosts } from '../../hooks/usePosts';
import { useCategories } from '../../hooks/useCategories';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NewsGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage, displayLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 6;

  const { data: newsPosts = {}, isLoading: postsLoading, isFetching } = useNewsPosts({ page, limit, language: currentLanguage });
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  console.log('newsPosts:', newsPosts);
  const posts = Array.isArray(newsPosts) ? newsPosts : newsPosts?.data || [];
  const totalPages = newsPosts?.meta?.totalPages || Math.ceil((Array.isArray(newsPosts) ? newsPosts.length : 0) / limit);
  console.log('posts:', posts, 'totalPages:', totalPages);

  const filteredPosts = selectedCategory === 'ALL'
    ? posts
    : posts.filter(post => post.categoryId === selectedCategory);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (postsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-600">{t('news.noPostsFound')}</h2>
        {selectedCategory && (
          <p className="text-gray-500 mt-2">
            {t('news.tryDifferentCategory')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[90vw] md:max-w-7xl mx-auto px-4 py-8 space-y-8 my-24 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary text-center md:text-left">{t('news.newsAndEvents')}</h1>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={t('news.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('news.allCategories')}</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFetching && (
        <div className="absolute top-4 right-4">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredPosts.map((post, index) => (
          <div
            key={post.id}
            className={`cursor-pointer group relative overflow-hidden rounded-lg ${index === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'} text-white`}
            onClick={() => navigate(`/${displayLanguage}/news/${post.slug}`, { state: { post } })}
          >
            <img
              src={post.imageUrl || '/placeholder.jpg'}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <div className="absolute bottom-0 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs md:text-sm text-primary-foreground/80 bg-primary px-2 py-1 rounded-full">
                    {post.type}
                  </span>
                  {post.category && (
                    <span className="text-xs md:text-sm">
                      {post.category.name}
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-semibold">{post.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8 flex flex-wrap justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={cn(page === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => handlePageChange(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={cn(page === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
