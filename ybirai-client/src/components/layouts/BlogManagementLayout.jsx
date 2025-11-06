import React from "react";
import { Outlet } from "react-router-dom";
import BlogAdminSidebar from "../ui/blog-admin-sidebar";

export default function BlogManagementLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="mx-auto max-w-7xl w-full flex">
        <aside className="hidden md:flex">
          <BlogAdminSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
