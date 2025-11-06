import React from 'react'
import {
  Button,
  Chip,
  User,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react"
import { useTranslation } from 'react-i18next'

const SchoolDetailsModal = ({ school, isOpen, onClose, statusColorMap }) => {
  const { t } = useTranslation();
  
  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex gap-1">
          <User
            avatarProps={{ radius: "lg", src: school?.logoUrl }}
            name={school?.name}
          />
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">{t('schools.modal.description')}</h3>
              <p className="text-sm text-default-500">{school?.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('schools.modal.details')}</h3>
              <div className="space-y-2">
                <p><span className="font-medium">{t('schools.modal.founded')}:</span> {school?.foundedYear}</p>
                <p><span className="font-medium">{t('schools.modal.website')}:</span> {school?.website}</p>
                <p><span className="font-medium">{t('schools.modal.email')}:</span> {school?.email}</p>
                <p><span className="font-medium">{t('schools.modal.phone')}:</span> {school?.phoneNumber}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('schools.modal.location')}</h3>
              <div className="space-y-2">
                <p><span className="font-medium">{t('schools.modal.address')}:</span> {school?.address}</p>
                <p><span className="font-medium">{t('schools.modal.city')}:</span> {school?.city}</p>
                <p><span className="font-medium">{t('schools.modal.country')}:</span> {school?.country}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('schools.modal.status')}</h3>
              <Chip
                className="capitalize mt-2"
                color={statusColorMap[school?.status]}
                size="sm"
                variant="flat"
              >
                {t(`schools.status.${school?.status?.toLowerCase()}`)}
              </Chip>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            {t('common.close')}
          </Button>
          <Button color="primary" onPress={onClose}>
            {t('schools.actions.edit')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SchoolDetailsModal
