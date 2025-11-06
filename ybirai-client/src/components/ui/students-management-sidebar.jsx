import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { School, Loader2 } from 'lucide-react';
import { useAuth } from "../../contexts/AuthContext";
import { useGetSchools } from "../../hooks/useGetSchools";

const SchoolItem = ({ school, isActive, onClick }) => {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={() => onClick(school)}
    >
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 transition-colors",
          isActive && "text-primary-600 hover:bg-primary/20 bg-transparent",
          !isActive && "hover:bg-primary/5"
        )}
      >
        <motion.span
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <School className={cn("h-4 w-4", isActive && "text-primary")} />
        </motion.span>
        {school.name}
      </Button>
    </motion.div>
  );
};

export function StudentsManagementSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: schools, isLoading } = useGetSchools();

  const currentPath = location.pathname;
  const schoolIdMatch = currentPath.match(/\/schools\/([^\/]+)/);
  const currentSchoolId = schoolIdMatch ? schoolIdMatch[1] : null;

  const handleSchoolClick = (school) => {
    navigate(`schools/${school.id}/courses`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userSchools = Array.isArray(schools) 
    ? schools.filter(school => school.email === user.email) 
    : [];

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Schools
      </h2>
      <div className="space-y-1">
        {userSchools.map((school) => (
          <SchoolItem
            key={school.id}
            school={school}
            isActive={school.id === currentSchoolId}
            onClick={handleSchoolClick}
          />
        ))}
      </div>
    </div>
  );
}
