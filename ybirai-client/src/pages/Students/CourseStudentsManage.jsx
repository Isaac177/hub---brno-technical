import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, GraduationCap, ArrowLeft } from 'lucide-react'
import { DataTable } from "../../components/ui/data-table"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

// TODO: Replace with actual hook
const useGetCourseStudents = (courseId) => {
  return {
    data: [],
    isLoading: false,
    isError: false,
    error: null
  }
}

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "enrollmentDate",
    header: "Enrolled On",
  },
  {
    accessorKey: "progress",
    header: "Course Progress",
    cell: ({ row }) => {
      const progress = row.original.progress || 0
      return `${progress}%`
    }
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]

export default function CourseStudentsManage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { user } = useAuth()
  const { 
    data: students, 
    isLoading, 
    isError, 
    error 
  } = useGetCourseStudents(courseId)

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Course Students</h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Students Enrolled
          </CardTitle>
          <CardDescription>
            Manage students enrolled in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={students}
            filterColumn="name"
            searchPlaceholder="Search students..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
