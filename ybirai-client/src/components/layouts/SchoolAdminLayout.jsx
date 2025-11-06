import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext.jsx";
import { SchoolAdminSidebar } from "../ui/school-admin-sidebar.jsx";

export function SchoolAdminLayout() {
  const { user, signOut, userSub } = useAuth();
  const navigate = useNavigate();

  console.log('SchoolAdminLayout Component: userSub:', userSub);
  console.log('SchoolAdminLayout Component: Auth State:', { user, userSub });

  useEffect(() => {
    if (!userSub) {
      console.log('No userSub found, redirecting to login.');
      signOut();
      navigate('/login');
    }
  }, [userSub, signOut, navigate]);

  console.log('Rendering SchoolAdminLayout');
  console.log('User:', user);
  console.log('User Sub:', userSub);

  if (!userSub || !user || user.role !== 'SCHOOL_ADMIN') {
    console.log('Redirecting to login due to missing userSub or incorrect user role');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background relative">
      <aside className="w-64 h-full fixed left-0 top-0 z-30">
        <SchoolAdminSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto p-8 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
