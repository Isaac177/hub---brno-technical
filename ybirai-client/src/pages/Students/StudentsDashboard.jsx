import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGetSchools } from '../../hooks/useGetSchools'
import { Loader2, GraduationCap } from 'lucide-react'
import { DataTable } from "../../components/ui/data-table"
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

// TODO: Replace with actual hook
const useGetStudents = () => {
  return {
    data: [],
    isLoading: false,
    isError: false,
    error: null
  }
}

export default function StudentsDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [selectedSchool, setSelectedSchool] = React.useState("")
  const { data: schools, isLoading: isLoadingSchools } = useGetSchools()
  const { 
    data: students, 
    isLoading: isLoadingStudents, 
    isError, 
    error 
  } = useGetStudents()
  
  const columns = [
    {
      accessorKey: "name",
      header: t('schools.table.columns.school'),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "school",
      header: t('education.unknownSchool'),
    },
    {
      accessorKey: "enrolledCourses",
      header: t('courses'),
      cell: ({ row }) => {
        const count = row.original.enrolledCourses?.length || 0
        return count
      }
    },
    {
      accessorKey: "status",
      header: t('schools.table.columns.status'),
    },
  ]

  if (isLoadingSchools || isLoadingStudents) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">{error?.message}</p>
      </div>
    )
  }

  const userSchools = schools?.filter(school => school.email === user.email) || []
  const filteredStudents = selectedSchool
    ? students.filter(student => student.schoolId === selectedSchool)
    : students

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          {t('students.title')}
        </CardTitle>
        <CardDescription>
          {t('schoolManagement.mySchools')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select
            value={selectedSchool}
            onValueChange={setSelectedSchool}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={t('search_school')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('schools.table.columns.school')}</SelectItem>
              {userSchools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable 
          columns={columns} 
          data={filteredStudents}
          filterColumn="name"
          searchPlaceholder={t('students.searchPlaceholder')}
        />
      </CardContent>
    </Card>
  )
}
