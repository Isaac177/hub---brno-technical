import React from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext.jsx";
import BlogManagementLayout from "../../components/layouts/BlogManagementLayout.jsx";
import BlogDashboard from './BlogDashboard.jsx';
import PostsManagement from './PostsManagement.jsx';
import CommentsManagement from './CommentsManagement.jsx';
import TagsManagement from './TagsManagement.jsx';
import LikesManagement from './LikesManagement.jsx';
import ViewsManagement from './ViewsManagement.jsx';
import BlogSettings from './BlogSettings.jsx';
import CategoryManagement from './CategoryManagement.jsx';
import { useGetUserByEmail } from '../../hooks/useGetUserByEmail.js';
import { Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

export default function BlogManagementRoutes() {
  const { userSub } = useAuth();
  const { data: userData, isLoading, error } = useGetUserByEmail();
  const { displayLanguage } = useLanguage();

  if (isLoading) {
    return <div className="flex justify-center items-center h-[400px]">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  if (error) {
    console.error('Error loading user data:', error);
    return <Navigate to={`/${displayLanguage}/catalog`} replace />
  }

  const userRole = userData?.role?.toUpperCase();
  if (!userRole || !userSub || userRole !== "PLATFORM_ADMIN") {
    return <Navigate to={`/${displayLanguage}/catalog`} replace />;
  }

  return (
    <Routes>
      <Route
        element={<BlogManagementLayout><Outlet /></BlogManagementLayout>}
      >
        <Route index element={<BlogDashboard />} />
        <Route path="posts" element={<PostsManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="comments" element={<CommentsManagement />} />
        <Route path="tags" element={<TagsManagement />} />
        <Route path="likes" element={<LikesManagement />} />
        <Route path="views" element={<ViewsManagement />} />
        <Route path="settings" element={<BlogSettings />} />
      </Route>
    </Routes>
  );
}
