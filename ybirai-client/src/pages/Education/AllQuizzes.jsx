import React, { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { useGetSchools } from '../../hooks/useGetSchools';
import { useGetBatchCoursesBySchool } from '../../hooks/useGetBatchCoursesBySchool';
import useGetAllQuizzes from '../../hooks/useGetAllQuizzes';
import { useDeleteQuiz } from '../../hooks/useDeleteQuiz';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Loader2, Search, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import CustomDropdown from "../../components/ui/custom-dropdown";
import { ConfirmDialog } from "../../components/ui/confirm-dialog.jsx";
import QuizViewDialog from "../../components/QuizViewDialog";
import { useNavigate } from 'react-router-dom';

const AllQuizzes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const { data: schools, isLoading: isLoadingSchools } = useGetSchools();
  const userSchools = schools?.filter(school => school.email === user?.email) || [];
  const schoolIds = userSchools.map(school => school.id);

  const {
    data: courses = [],
    isLoading: isLoadingCourses
  } = useGetBatchCoursesBySchool(schoolIds);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      // Try to find a course that has quizzes, otherwise fall back to first course
      const courseWithQuizzes = courses.find(course => 
        course.quizzes && course.quizzes.length > 0
      );
      setSelectedCourseId(courseWithQuizzes?.id || courses[0].id);
    }
  }, [courses]);

  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes
  } = useGetAllQuizzes(selectedCourseId);

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  const filteredQuizzes = (Array.isArray(quizzes) ? quizzes : []).filter(quiz => {
    const matchesSearch = searchTerm === '' ||
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = difficultyFilter === 'ALL' ||
      quiz.difficultyLevel === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const deleteQuizMutation = useDeleteQuiz();

  const handleViewQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      requestAnimationFrame(() => {
        setSelectedQuiz(null);
      });
    }
  };

  const handleEditQuiz = (quiz) => {
    navigate(`/${displayLanguage}/${user.sub}/admin/education/quizzes/create/${quiz.id}`, {
      state: {
        quiz,
        course: currentCourse,
        isEditing: true
      }
    });
  };

  const handleDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      deleteQuizMutation.mutate({
        id: quizToDelete.id,
        courseId: selectedCourseId
      });
    }
  };

  if (isLoadingSchools || isLoadingCourses || isLoadingQuizzes) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('allQuizzes.title')}</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('allQuizzes.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedCourseId || ''}
          onValueChange={setSelectedCourseId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('allQuizzes.selectCourse')} />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => {
              const courseQuizCount = course.quizzes?.length || 0;
              return (
                <SelectItem key={course.id} value={course.id}>
                  {course.title} ({courseQuizCount})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select
          value={difficultyFilter}
          onValueChange={setDifficultyFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allQuizzes.difficultyLevel.label')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allQuizzes.difficultyLevel.all')}</SelectItem>
            <SelectItem value="BEGINNER">{t('allQuizzes.difficultyLevel.beginner')}</SelectItem>
            <SelectItem value="INTERMEDIATE">{t('allQuizzes.difficultyLevel.intermediate')}</SelectItem>
            <SelectItem value="ADVANCED">{t('allQuizzes.difficultyLevel.advanced')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('allQuizzes.table.quizTitle')}</TableHead>
              <TableHead>{t('allQuizzes.table.course')}</TableHead>
              <TableHead>{t('allQuizzes.table.difficulty')}</TableHead>
              <TableHead>{t('allQuizzes.table.timeLimit')}</TableHead>
              <TableHead>{t('allQuizzes.table.passingScore')}</TableHead>
              <TableHead>{t('allQuizzes.table.status')}</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{currentCourse?.title || t('allQuizzes.table.unknownCourse')}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {quiz.difficultyLevel.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>{quiz.timeLimit} {t('allQuizzes.table.minutes')}</TableCell>
                <TableCell>{quiz.passingScore}%</TableCell>
                <TableCell>
                  <Badge
                    variant={quiz.isDraft ? "secondary" : "success"}
                  >
                    {quiz.isDraft ? t('allQuizzes.table.draft') : t('allQuizzes.table.published')}
                  </Badge>
                </TableCell>
                <TableCell className="relative">
                  <CustomDropdown
                    trigger={
                      <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    }
                    items={[
                      {
                        icon: <Eye className="h-4 w-4" />,
                        label: t('allQuizzes.actions.viewQuiz'),
                        onClick: () => handleViewQuiz(quiz)
                      },
                      {
                        icon: <Edit className="h-4 w-4" />,
                        label: t('allQuizzes.actions.editQuiz'),
                        onClick: () => handleEditQuiz(quiz)
                      },
                      {
                        icon: <Trash2 className="h-4 w-4" />,
                        label: t('allQuizzes.actions.deleteQuiz'),
                        onClick: () => handleDeleteQuiz(quiz),
                        className: 'text-red-600'
                      }
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredQuizzes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('allQuizzes.table.noQuizzes')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuizViewDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        quiz={selectedQuiz}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('allQuizzes.deleteConfirm.title')}
        description={t('allQuizzes.deleteConfirm.description', { quizTitle: quizToDelete?.title })}
        onConfirm={confirmDelete}
        confirmText={t('allQuizzes.deleteConfirm.confirm')}
        cancelText={t('allQuizzes.deleteConfirm.cancel')}
      />
    </div>
  );
};

export default AllQuizzes;
