import React, { useState } from 'react'
import { validateSchoolData } from '../../validators/validateSchoolData.js'
import { SingleImageUpload } from '../../components/common/SingleImageUpload.jsx'
import { useUserData } from '../../contexts/UserContext.jsx'
import { useEditSchool } from '../../hooks/useEditSchool.js'
import { toast } from "sonner"
import { Input, Button, Card, CardBody, Divider } from "@nextui-org/react"
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigate } from "react-router-dom"

export default function EditSchoolForm({ school, onCancel }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  let userEmail = user?.email

  const { mutate: editSchool, isLoading, isError, error } = useEditSchool(school.id)

  const [formData, setFormData] = useState({
    name: school.name || '',
    description: school.description || '',
    website: school.website || '',
    foundedYear: school.foundedYear || new Date().getFullYear(),
    address: school.address || '',
    city: school.city || '',
    country: school.country || '',
    phoneNumber: school.phoneNumber || '',
    email: userEmail,
    logo: school.logoUrl ? {
      url: school.logoUrl,
      alt: school.name || 'School logo',
    } : null
  })

  const [errors, setErrors] = useState({})
  const { userData } = useUserData()
  const userId = userData?.id

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const validationErrors = validateSchoolData(formData)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      const schoolRequest = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        foundedYear: formData.foundedYear,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        email: userEmail,
        status: school.status,
        primaryContactUserId: userId
      }

      await editSchool({
        request: schoolRequest,
        logo: formData.logo
      })

      onCancel?.()
    } catch (error) {
      toast.error(error.message || 'Error updating school')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <Card className="w-full">
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <Input
            label="School Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            variant="bordered"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">School Logo</p>
            <SingleImageUpload
              image={formData.logo}
              initialPreview={school.logoUrl}
              onChange={(logo) => setFormData(prev => ({ ...prev, logo }))}
              previewClassName="w-32 h-32 object-cover rounded-lg"
            />
          </div>

          <Input
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            isInvalid={!!errors.website}
            errorMessage={errors.website}
            variant="bordered"
          />

          <Input
            label="Founded Year"
            name="foundedYear"
            type="number"
            value={formData.foundedYear}
            onChange={handleChange}
            isInvalid={!!errors.foundedYear}
            errorMessage={errors.foundedYear}
            variant="bordered"
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            isInvalid={!!errors.address}
            errorMessage={errors.address}
            variant="bordered"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              isInvalid={!!errors.city}
              errorMessage={errors.city}
              variant="bordered"
            />

            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              isInvalid={!!errors.country}
              errorMessage={errors.country}
              variant="bordered"
            />
          </div>

          <Input
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            isInvalid={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber}
            variant="bordered"
          />

          {isError && <p className='text-danger'>{error.message}</p>}

          <Divider className="my-4" />

          <div className="flex gap-3 justify-end">
            <Button
              color="danger"
              variant="flat"
              onPress={onCancel}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="success"
              type="submit"
              variant="solid"
              isDisabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
