import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  User,
  useDisclosure
} from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import SchoolDetailsModal from "./SchoolDetailsModal.jsx";

const SchoolsTable = ({ schools, onEdit }) => {
  const { t } = useTranslation();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [selectedSchool, setSelectedSchool] = React.useState(null);

  const statusColorMap = {
    APPROVED: "success",
    PENDING: "warning",
    REJECTED: "danger"
  };

  const handleView = (school) => {
    setSelectedSchool(school);
    onOpen();
  };

  const handleEdit = (schoolId) => {
    onEdit?.(schoolId);
  };

  const columns = [
    { key: "school", label: t('schools.table.columns.school') },
    { key: "foundedYear", label: t('schools.table.columns.founded') },
    { key: "contact", label: t('schools.table.columns.contact') },
    { key: "location", label: t('schools.table.columns.location') },
    { key: "status", label: t('schools.table.columns.status') },
    { key: "actions", label: t('schools.table.columns.actions') }
  ];

  const renderCell = (school, columnKey) => {
    switch (columnKey) {
      case "school":
        return (
          <User
            avatarProps={{ radius: "lg", src: school.logoUrl }}
            description={school.website}
            name={school.name}
          >
            {school.name}
          </User>
        );

      case "foundedYear":
        return <div>{school.foundedYear}</div>;

      case "contact":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{school.email}</p>
            <p className="text-sm text-default-400">{school.phoneNumber}</p>
          </div>
        );

      case "location":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{school.city}</p>
            <p className="text-sm text-default-400">{school.country}</p>
          </div>
        );

      case "status":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[school.status]}
            size="sm"
            variant="flat"
          >
            {t(`schools.status.${school.status.toLowerCase()}`)}
          </Chip>
        );

      case "actions":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() => handleView(school)}
            >
              {t('schools.actions.view')}
            </Button>
            <Button
              size="sm"
              variant='bordered'
              color="secondary"
              onPress={() => handleEdit(school.id)}
            >
              {t('schools.actions.edit')}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Table
        aria-label={t('schools.table.ariaLabel')}
        className="min-h-[400px]"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={schools}>
          {(school) => (
            <TableRow key={school.id}>
              {(columnKey) => (
                <TableCell>{renderCell(school, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <SchoolDetailsModal
        statusColorMap={statusColorMap}
        school={selectedSchool}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default SchoolsTable;
