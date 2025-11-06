import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageCircle,
  PlusCircle,
  Calendar,
  Megaphone,
  Search
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCategories } from '../../hooks/useCategories';
import { cn } from '../../lib/utils';
import { useDebounce } from '../../hooks/useDebounce';
import { Loader } from '../ui/loader';
import CreatePostDialog from '../blog/CreatePostDialog';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const ForumSidebar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'ALL';
  const currentCategory = searchParams.get('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const sidebarItems = [
    { id: 'ALL', icon: <MessageCircle size={20} />, label: t('forum.leftSidebar.navigation.allDiscussions') },
    { id: 'DISCUSSION', icon: <MessageCircle size={20} />, label: t('forum.leftSidebar.navigation.discussions') },
    { id: 'EVENT', icon: <Calendar size={20} />, label: t('forum.leftSidebar.navigation.events') },
    { id: 'ANNOUNCEMENT', icon: <Megaphone size={20} />, label: t('forum.leftSidebar.navigation.announcements') },
  ];

  const handleViewChange = (viewId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', viewId);
    newParams.delete('category');
    newParams.delete('post');
    navigate(`/${displayLanguage}/forum?${newParams.toString()}`);
  };

  const handleCategoryClick = (categorySlug) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', categorySlug);
    newParams.delete('view');
    newParams.delete('post');
    navigate(`/${displayLanguage}/forum?${newParams.toString()}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newParams.set('search', e.target.value);
    } else {
      newParams.delete('search');
    }
    navigate(`/${displayLanguage}/forum?${newParams.toString()}`);
  };

  return (
    <div className="w-full lg:w-64 space-y-6 px-4 lg:px-0">
      {/* Поисковое поле с адаптацией */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder={t('forum.leftSidebar.search')}
          className="w-full max-w-[90%] mx-auto p-2 border rounded-lg"
          icon={<Search className="h-4 w-4" />}
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Кнопка создания поста */}
        <Button
          className="w-full max-w-[90%] mx-auto flex items-center justify-center p-2 bg-primary rounded-lg"
          onClick={() => setCreateDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('forum.leftSidebar.createDiscussion')}
        </Button>

        <CreatePostDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          defaultType="DISCUSSION"
        />

        {/* Навигация с адаптивной сеткой */}
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                currentView === item.id && "bg-secondary"
              )}
              onClick={() => handleViewChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Категории с адаптивностью */}
      <div className="space-y-4">
        <h3 className="font-semibold text-center lg:text-left">{t('forum.leftSidebar.categories')}</h3>
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {categoriesLoading ? (
            <Loader size={20} className="my-4" />
          ) : (
            categories?.map((category) => (
              <Badge
                key={category.id}
                variant={currentCategory === category.slug ? "active" : "secondary"}
                className="cursor-pointer transition-all hover:scale-105 px-4 py-2"
                onClick={() => handleCategoryClick(category.slug)}
              >
                {category.name}
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumSidebar;
