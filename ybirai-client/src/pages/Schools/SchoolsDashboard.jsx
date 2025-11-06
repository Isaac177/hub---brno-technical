import React, { useEffect } from 'react'
import { useGetSchools } from '../../hooks/useGetSchools'
import { useDeleteSchool } from '../../hooks/useDeleteSchool'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import { Loader2, School, Search, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { useNavigate } from "react-router-dom"
import { useSchool } from "../../contexts/SchoolContext"
import { useUserData } from '../../contexts/UserContext'
import CreateSchoolForm from "../../components/forms/CreateSchoolForm"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { ScrollArea } from "../../components/ui/scroll-area"
import { ConfirmDialog } from "../../components/ui/confirm-dialog"
import { BulkActionWrapper, BulkSelectHeader, BulkSelectCell } from "../../components/ui/BulkActionWrapper"
import { BulkActionBar } from "../../components/ui/BulkActionBar"
import { useUpdateSchool } from "../../hooks/useUpdateSchool"

export default function SchoolsDashboard() {
  const { user } = useAuth()
  const { userData } = useUserData()
  const navigate = useNavigate()
  const { setSelectedSchool } = useSchool()
  const { t } = useTranslation()
  const { displayLanguage } = useLanguage()
  const { data: schools, isLoading, isError, error, refetch } = useGetSchools(displayLanguage)
  const deleteSchool = useDeleteSchool()
  const updateSchool = useUpdateSchool()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [deleteDialogState, setDeleteDialogState] = React.useState({ open: false, schoolId: null, isLoading: false })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isBulkLoading, setIsBulkLoading] = React.useState(false)

  useEffect(() => {
    refetch();
  }, [refetch, displayLanguage]);

  const handleEditSchool = (school) => {
    setSelectedSchool(school)
    setIsEditDialogOpen(true)
  }

  const handleViewSchool = (schoolId) => {
    navigate(`${window.location.pathname}/${schoolId}`)
  }

  const handleDeleteClick = (schoolId) => {
    setDeleteDialogState({ open: true, schoolId, isLoading: false })
  }

  const handleConfirmDelete = async () => {
    setDeleteDialogState(prev => ({ ...prev, isLoading: true }))
    try {
      await deleteSchool.mutateAsync(deleteDialogState.schoolId)
      setDeleteDialogState({ open: false, schoolId: null, isLoading: false })
    } catch (error) {
      console.error('Failed to delete school:', error)
      setDeleteDialogState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleBulkAction = async (action, selectedIds) => {
    setIsBulkLoading(true)
    try {
      switch (action) {
        case 'activate':
          for (const id of selectedIds) {
            const school = filteredSchools.find(s => s.id === id)
            if (school) {
              console.log('🔄 Activating school:', { id, currentStatus: school.status, newStatus: 'APPROVED' });

              const schoolRequest = {
                name: school.name,
                description: school.description,
                website: school.website,
                foundedYear: school.foundedYear,
                address: school.address,
                city: school.city,
                country: school.country,
                phoneNumber: school.phoneNumber,
                email: school.email,
                primaryContactEmail: school.primaryContactEmail, // Only use if explicitly set
                status: 'APPROVED'  // Add status field
              }

              console.log('📤 Sending request for activation:', JSON.stringify(schoolRequest, null, 2));

              await updateSchool.mutateAsync({
                id,
                request: schoolRequest
              })
            }
          }
          break
        case 'deactivate':
          for (const id of selectedIds) {
            const school = filteredSchools.find(s => s.id === id)
            if (school) {
              console.log('🔄 Deactivating school:', { id, currentStatus: school.status, newStatus: 'PENDING' });

              const schoolRequest = {
                name: school.name,
                description: school.description,
                website: school.website,
                foundedYear: school.foundedYear,
                address: school.address,
                city: school.city,
                country: school.country,
                phoneNumber: school.phoneNumber,
                email: school.email,
                primaryContactEmail: school.primaryContactEmail, // Only use if explicitly set
                status: 'PENDING'  // Add status field
              }

              console.log('📤 Sending request for deactivation:', JSON.stringify(schoolRequest, null, 2));

              await updateSchool.mutateAsync({
                id,
                request: schoolRequest
              })
            }
          }
          break
        case 'delete':
          for (const id of selectedIds) {
            console.log('🗑️ Deleting school:', id);
            await deleteSchool.mutateAsync(id)
          }
          break
        default:
          console.warn('Unknown bulk action:', action)
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsBulkLoading(false)
    }
  }

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

  const filteredSchools = Array.isArray(schools)
    ? schools
      .filter(school => {
        if (userData?.role === 'SCHOOL_ADMIN') {
          return school.email === user?.email || school.primaryContactUserEmail === user?.email;
        }
        return true;
      })
      .filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (school.email && school.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <School className="h-6 w-6" />
              {t('schoolManagement.schoolDashboard.title')}
            </CardTitle>
            <CardDescription>
              {t('schoolManagement.schoolDashboard.description')}
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t('schoolManagement.createSchool')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] h-[80vh]">
              <DialogHeader>
                <DialogTitle>{t('schoolManagement.createSchool')}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[calc(80vh-120px)]">
                <div className="px-6">
                  <CreateSchoolForm
                    onSuccess={() => setIsCreateDialogOpen(false)}
                  />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('schoolManagement.schoolDashboard.searchPlaceholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <BulkActionWrapper
          data={filteredSchools}
          onBulkAction={handleBulkAction}
          renderBulkActions={({ selectedCount, clearSelection, handleBulkAction }) => (
            <BulkActionBar
              selectedCount={selectedCount}
              onClearSelection={clearSelection}
              isLoading={isBulkLoading}
              actions={[
                {
                  label: 'Activate Schools',
                  icon: CheckCircle,
                  onClick: () => handleBulkAction('activate'),
                },
                {
                  label: 'Deactivate Schools',
                  icon: XCircle,
                  onClick: () => handleBulkAction('deactivate'),
                },
                {
                  label: 'Delete Schools',
                  icon: Trash2,
                  onClick: () => handleBulkAction('delete'),
                  variant: 'destructive',
                },
              ]}
            />
          )}
        >
          {({ selectedItems, handleSelectAll, handleSelectItem, isAllSelected, isIndeterminate }) => (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <BulkSelectHeader
                        isAllSelected={isAllSelected}
                        isIndeterminate={isIndeterminate}
                        onSelectAll={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{t('schoolManagement.schoolDashboard.table.logo')}</TableHead>
                    <TableHead>{t('schoolManagement.schoolDashboard.table.name')}</TableHead>
                    <TableHead>{t('schoolManagement.schoolDashboard.table.description')}</TableHead>
                    <TableHead>{t('schoolManagement.schoolDashboard.table.status')}</TableHead>
                    <TableHead>{t('schoolManagement.schoolDashboard.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell>
                        <BulkSelectCell
                          itemId={school.id}
                          isSelected={selectedItems.has(school.id)}
                          onSelectItem={handleSelectItem}
                        />
                      </TableCell>
                      <TableCell>
                        {school.logoUrl ? (
                          <img
                            src={school.logoUrl}
                            alt={`${school.name} logo`}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="h-10 w-10 rounded-md bg-muted flex items-center justify-center"
                          style={{ display: school.logoUrl ? 'none' : 'flex' }}
                        >
                          <School className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${school.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {school.status === 'APPROVED'
                            ? t('schoolManagement.schoolDashboard.status.active')
                            : t('schoolManagement.schoolDashboard.status.inactive')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSchool(school.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSchool(school)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(school.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </BulkActionWrapper>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[800px] h-[80vh]">
            <DialogHeader>
              <DialogTitle>{t('schoolManagement.schoolDashboard.actions.edit')}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(80vh-120px)]">
              <div className="px-6">
                <CreateSchoolForm
                  isEdit
                  onSuccess={() => setIsEditDialogOpen(false)}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={deleteDialogState.open}
          onOpenChange={(open) => setDeleteDialogState(prev => ({ ...prev, open }))}
          title={t('schoolManagement.schoolDashboard.deleteDialog.title')}
          description={t('schoolManagement.schoolDashboard.deleteDialog.description')}
          onConfirm={handleConfirmDelete}
          isLoading={deleteDialogState.isLoading}
        />
      </CardContent>
    </Card>
  )
}
