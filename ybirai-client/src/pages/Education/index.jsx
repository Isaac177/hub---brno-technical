import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetStudyStatistics } from '../../hooks/useGetStudyStatistics';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Button } from "../../components/ui/button";
import { Download, Users, BookOpen, Award, TrendingUp, Activity, GraduationCap, Target } from "lucide-react";
import { LoaderCircle } from "lucide-react";

export default function Education() {
  const { t } = useTranslation();
  const { data: stats, isLoading, error } = useGetStudyStatistics();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Error Loading Statistics
        </h2>
        <p className="text-gray-600">
          {error?.message || 'Failed to load study statistics'}
        </p>
      </div>
    </div>;
  }

  if (!stats || !stats.success) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-orange-600 mb-2">
          Partial Statistics Available
        </h2>
        <p className="text-gray-600">
          {stats?.error || 'Some services are unavailable, showing available data'}
        </p>
      </div>
    </div>;
  }

  const { courseStatistics, userStatistics, enrollmentStatistics } = stats;

  // Check service availability
  const isUserServiceAvailable = userStatistics && !userStatistics.error;
  const isEnrollmentServiceAvailable = enrollmentStatistics && !enrollmentStatistics.error;
  const isCourseServiceAvailable = courseStatistics && !courseStatistics.error;

  // Prepare data for charts
  const coursesByLanguageData = Object.entries(courseStatistics?.coursesByLanguage || {}).map(([lang, count]) => ({
    language: lang.toUpperCase(),
    courses: count
  }));

  const enrollmentStatusData = Object.entries(enrollmentStatistics?.enrollmentsByStatus || {}).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count: count
  }));

  const achievementData = Object.entries(userStatistics?.achievementsByType || {}).map(([type, count]) => ({
    type: type.replace('_', ' '),
    count: count
  }));

  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Study Statistics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-sm font-medium">Services:</span>
            <div className={`w-3 h-3 rounded-full ${isCourseServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`} title="Course Service"></div>
            <div className={`w-3 h-3 rounded-full ${isUserServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`} title="User Service"></div>
            <div className={`w-3 h-3 rounded-full ${isEnrollmentServiceAvailable ? 'bg-green-500' : 'bg-red-500'}`} title="Enrollment Service"></div>
          </div>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseStatistics?.totalCourses || 0}</div>
            <div className="text-xs text-muted-foreground">
              +{courseStatistics?.recentCourses || 0} this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentStatistics?.totalStudents || 0}</div>
            <div className="text-xs text-muted-foreground">
              {userStatistics?.usersWithQuizActivity || 0} active learners
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentStatistics?.totalEnrollments || 0}</div>
            <div className="text-xs text-muted-foreground">
              +{enrollmentStatistics?.recentEnrollments || 0} recent enrollments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentStatistics?.completionRate?.toFixed(1) || 0}%</div>
            <div className="text-xs text-muted-foreground">
              {enrollmentStatistics?.completedEnrollments || 0} completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Learning Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                {
                  name: 'Quiz Performance',
                  'Average Score': userStatistics?.averageQuizScore || 0,
                  'Pass Rate': enrollmentStatistics?.quizPassRate || 0,
                  'Perfect Scores': (userStatistics?.usersWithPerfectScores / userStatistics?.totalUsers * 100) || 0
                },
                {
                  name: 'Course Progress',
                  'Average Progress': enrollmentStatistics?.averageProgress || 0,
                  'Completion Rate': enrollmentStatistics?.completionRate || 0,
                  'Active Rate': (enrollmentStatistics?.activeEnrollments / enrollmentStatistics?.totalEnrollments * 100) || 0
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Average Score" fill="#8884d8" />
                <Bar dataKey="Pass Rate" fill="#82ca9d" />
                <Bar dataKey="Perfect Scores" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Enrollment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={enrollmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {enrollmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses by Language</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursesByLanguageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="courses" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievementData.length > 0 ? achievementData.map((achievement) => (
                <div className="flex items-center justify-between" key={achievement.type}>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{achievement.type}</span>
                  </div>
                  <span className="text-lg font-bold">{achievement.count}</span>
                </div>
              )) : (
                <div className="text-center text-gray-500 py-4">
                  <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>UserService unavailable</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Avg Course Price</span>
                </div>
                <span className="text-lg font-bold">${courseStatistics?.averageCoursePrice?.toFixed(2) || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Quiz Attempts</span>
                </div>
                <span className="text-lg font-bold">{userStatistics?.totalQuizAttempts || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <span className="text-lg font-bold">{userStatistics?.activeUsersCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Avg Enrollments/Student</span>
                </div>
                <span className="text-lg font-bold">{enrollmentStatistics?.averageEnrollmentsPerStudent?.toFixed(1) || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses Section */}
      {enrollmentStatistics?.topCoursesByEnrollment && (
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollmentStatistics.topCoursesByEnrollment.slice(0, 10).map((course, index) => (
                <div className="flex items-center justify-between" key={course.courseId}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Course ID: {course.courseId}</p>
                      <p className="text-xs text-muted-foreground">{course.enrollmentCount} enrollments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min((course.enrollmentCount / Math.max(...enrollmentStatistics.topCoursesByEnrollment.map(c => c.enrollmentCount))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}