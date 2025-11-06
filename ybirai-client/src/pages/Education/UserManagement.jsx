import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetUsers, useUserManagement } from '../../hooks/useUserManagement';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';

const UserManagement = () => {
  const { session } = useAuth();
  const { displayLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const itemsPerPage = 10;

  const token = session?.tokens?.accessToken?.toString();

  const { data: usersResponse, isLoading, error: usersError, refetch } = useGetUsers(token, displayLanguage);
  const { deleteUser, activateUser, deactivateUser, isDeleting, isActivating } = useUserManagement(token, displayLanguage);

  const allUsers = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
  const totalCount = allUsers.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const users = allUsers.slice(startIndex, endIndex);

  const handleDeleteClick = (user) => {
    setDeleteDialog({ open: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      try {
        await deleteUser(deleteDialog.user.id, deleteDialog.user.email);
        setDeleteDialog({ open: false, user: null });
        toast.success(`User ${deleteDialog.user.firstName} ${deleteDialog.user.lastName} has been deleted successfully`);
        refetch();
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user. Please try again.');
      }
    }
  };

  const handleActivateToggle = async (user) => {
    try {
      const isCurrentlyActive = user.status === 'ACTIVE';
      if (isCurrentlyActive) {
        await deactivateUser(user.id);
        toast.success(`User ${user.firstName} ${user.lastName} has been deactivated`);
      } else {
        await activateUser(user.id);
        toast.success(`User ${user.firstName} ${user.lastName} has been activated`);
      }
      refetch();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading users: {usersError.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all students in the system</p>
        </div>

        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total Users: {totalCount} | Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => refetch()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.id?.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleActivateToggle(user)}
                            disabled={isActivating}
                            className="mr-3 flex items-center text-orange-600 hover:text-orange-900"
                          >
                            {isActivating ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : null}
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            disabled={isDeleting}
                            className="flex items-center text-red-600 hover:text-red-900"
                          >
                            {isDeleting ? (
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: open ? deleteDialog.user : null })}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteDialog.user?.firstName} ${deleteDialog.user?.lastName}? This action cannot be undone and will also delete the user from Cognito.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserManagement;