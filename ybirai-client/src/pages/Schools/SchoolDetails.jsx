import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetSchoolById } from '../../hooks/useGetSchoolById'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Loader2, School, ArrowLeft, Mail, Phone, Globe, Calendar, MapPin, 
  Users, BookOpen, TrendingUp, Award, BarChart3, PieChart, 
  GraduationCap, Clock, CheckCircle, XCircle, Pause, 
  Star, Brain, Target, UserCheck
} from 'lucide-react'
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import {
  Badge
} from "../../components/ui/badge"
import {
  Progress
} from "../../components/ui/progress"

export default function SchoolDetails() {
  const { schoolId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { displayLanguage } = useLanguage()
  const { data: school, isLoading, isError, error } = useGetSchoolById(schoolId, displayLanguage)

  // Log the school data to see if we get aggregated data from all services
  useEffect(() => {
    if (school) {
      console.log('🏫 School data received:', school);
    }
  }, [school])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">{error.message}</p>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">School not found</p>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMPLETED': { variant: 'success', icon: CheckCircle, label: 'Completed' },
      'ACTIVE': { variant: 'default', icon: Clock, label: 'Active' },
      'ON_HOLD': { variant: 'secondary', icon: Pause, label: 'On Hold' }
    }
    
    const config = statusConfig[status] || { variant: 'outline', icon: XCircle, label: status }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const studentData = school.studentData || {}
  const courseData = school.courseData || {}

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
      </div>

      {/* School Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <School className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl font-bold">{school.name}</CardTitle>
                <Badge variant={school.status === 'APPROVED' ? 'success' : 'secondary'}>
                  {school.status}
                </Badge>
              </div>
              <CardDescription className="text-lg mb-4">{school.description}</CardDescription>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{studentData.totalStudents || 0}</span>
                  <span className="text-muted-foreground">Students</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{courseData.courseCount || 0}</span>
                  <span className="text-muted-foreground">Courses</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{studentData.totalEnrollments || 0}</span>
                  <span className="text-muted-foreground">Enrollments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{studentData.averageProgress || 0}%</span>
                  <span className="text-muted-foreground">Avg Progress</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats Cards */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentData.totalStudents || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{courseData.courseCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentData.totalEnrollments || 0}</p>
                    <p className="text-sm text-muted-foreground">Enrollments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Target className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{studentData.quizCompletionRate || 0}%</p>
                    <p className="text-sm text-muted-foreground">Quiz Success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Status Distribution */}
          {studentData.enrollmentsByStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Enrollment Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(studentData.enrollmentsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                        <span className="font-medium">{status.replace('_', ' ')}</span>
                      </div>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-3xl font-bold">{studentData.totalStudents || 0}</p>
                <p className="text-muted-foreground">Unique Students</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-3xl font-bold">{studentData.averageProgress || 0}%</p>
                <p className="text-muted-foreground">Average Progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <p className="text-3xl font-bold">{studentData.totalQuizAttempts || 0}</p>
                <p className="text-muted-foreground">Quiz Attempts</p>
              </CardContent>
            </Card>
          </div>

          {/* Students List */}
          {studentData.students && studentData.students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Enrolled Students ({studentData.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentData.students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {student.userEmail ? student.userEmail.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-medium">{student.userEmail || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.enrollmentCount} enrollment{student.enrollmentCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{student.enrollmentCount} courses</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {courseData.courses && courseData.courses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Available Courses ({courseData.courses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {courseData.courses.map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <Badge variant="outline">${course.price || 0}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Created: {formatDate(course.createdAt)}
                        </span>
                        <Badge variant="success">{course.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Progress Analytics */}
            {studentData.courseProgress && studentData.courseProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Course Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {studentData.courseProgress.map((progress, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Course {progress.courseId.slice(0, 8)}...</span>
                          <span className="text-sm text-muted-foreground">{progress.overallProgress}%</span>
                        </div>
                        <Progress value={progress.overallProgress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{progress.completedComponents}/{progress.totalComponents} components</span>
                          <span>Updated: {formatDate(progress.lastUpdated)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Performance */}
            {studentData.quizProgress && studentData.quizProgress.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quiz Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {studentData.quizProgress.map((quiz, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Quiz {quiz.quizId.slice(0, 8)}...</span>
                          <Badge variant={quiz.passed ? 'success' : 'destructive'}>
                            {quiz.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>Attempts: {quiz.attempts}</div>
                          <div>Best Score: {quiz.bestScore}%</div>
                          <div>Last: {formatDate(quiz.lastAttemptAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Overall Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {studentData.averageProgress || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Course Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {studentData.quizCompletionRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Quiz Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {studentData.totalQuizAttempts || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Quiz Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{school.email}</p>
                    </div>
                  </div>
                )}
                {school.primaryContactUserEmail && school.primaryContactUserEmail !== school.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Primary Contact</p>
                      <p className="text-muted-foreground">{school.primaryContactUserEmail}</p>
                    </div>
                  </div>
                )}
                {school.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{school.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={school.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {school.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>School Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.foundedYear && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Founded</p>
                      <p className="text-muted-foreground">{school.foundedYear}</p>
                    </div>
                  </div>
                )}
                {(school.address || school.city || school.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <div className="text-muted-foreground">
                        {school.address && <div>{school.address}</div>}
                        {(school.city || school.country) && (
                          <div>{[school.city, school.country].filter(Boolean).join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}