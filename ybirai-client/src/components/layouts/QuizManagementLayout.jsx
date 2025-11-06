import React from "react";
import QuizSidebar from "../sidebars/QuizSidebar";
import { Outlet } from "react-router-dom";

const QuizManagementLayout = () => {
  return (
    <div className="flex justify-center min-h-screen bg-background">
      <div className="flex w-full">
        <QuizSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizManagementLayout;
