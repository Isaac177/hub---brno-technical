import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { LoaderCircle, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useUserData } from "../../contexts/UserContext"
import { useCreateSchool } from "../../hooks/useCreateSchool"
import { useUpdateSchool } from "../../hooks/useUpdateSchool"
import { useSchool } from "../../contexts/SchoolContext"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { SingleImageUpload } from "../common/SingleImageUpload"

const ImagePreview = ({ src, onRemove }) => {
  const { t } = useTranslation()
  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={t('school.logo.preview')}
        className="h-32 w-32 object-cover rounded-lg"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function CreateSchoolForm({ isEdit = false, onSuccess }) {
  const { t } = useTranslation()
  const { userData } = useUserData()
  const { mutateAsync: createSchool, isLoading: isCreating } = useCreateSchool()
  const { mutateAsync: updateSchool, isLoading: isUpdating } = useUpdateSchool()
  const { selectedSchool, setSelectedSchool } = useSchool()
  const isLoading = isCreating || isUpdating

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      website: "",
      foundedYear: new Date().getFullYear().toString(),
      address: "",
      city: "",
      country: "",
      phoneNumber: "",
      email: "",
      logo: null,
    },
  })

  useEffect(() => {
    if (isEdit && selectedSchool) {
      form.reset({
        ...selectedSchool,
        foundedYear: selectedSchool.foundedYear.toString(),
        logo: selectedSchool.logoUrl
      })
    }
  }, [isEdit, selectedSchool, form])

  const onSubmit = async (data) => {
    const schoolRequest = {
      name: data.name,
      description: data.description,
      website: data.website,
      foundedYear: parseInt(data.foundedYear),
      address: data.address,
      city: data.city,
      country: data.country,
      phoneNumber: data.phoneNumber,
      email: data.email
    };

    try {
      if (!selectedSchool?.id && isEdit) {
        toast.error(t('school.error.missingId'))
        return
      }

      if (isEdit) {
        await toast.promise(
          (async () => {
            await updateSchool({
              id: selectedSchool.id,
              request: schoolRequest,
              logo: data.logo instanceof File ? data.logo : null,
            })
            setSelectedSchool(null)
            onSuccess?.()
            form.reset()
          })(),
          {
            loading: t('school.update.loading'),
            success: t('school.update.success'),
            error: (err) => err.message || t('school.update.error')
          }
        )
      } else {
        await toast.promise(
          (async () => {
            await createSchool({
              request: schoolRequest,
              logo: data.logo instanceof File ? data.logo : null
            })
            onSuccess?.()
            form.reset()
          })(),
          {
            loading: t('school.create.loading'),
            success: t('school.create.success'),
            error: (err) => err.message || t('school.create.error')
          }
        )
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <div className="w-full py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-gray-500">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.logo')}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {field.value ? (
                      <ImagePreview
                        src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
                        onRemove={() => {
                          field.onChange(null)
                          if (isEdit && typeof field.value === 'string') {
                            toast.success(t('school.logo.removeSuccess'))
                          }
                        }}
                      />
                    ) : (
                      <SingleImageUpload
                        image={field.value ? {
                          url: field.value instanceof File ? URL.createObjectURL(field.value) : field.value,
                          file: field.value instanceof File ? field.value : null
                        } : null}
                        onChange={(imageData) => {
                          if (imageData?.file) {
                            field.onChange(imageData.file)
                          } else {
                            field.onChange(null)
                          }
                        }}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            rules={{ required: t('school.validation.nameRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.name')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: t('school.validation.descriptionRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.description')}</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="website"
              rules={{ required: t('school.validation.websiteRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('school.form.website')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foundedYear"
              rules={{
                required: t('school.validation.foundedYearRequired'),
                pattern: {
                  value: /^\d{4}$/,
                  message: t('school.validation.foundedYearInvalid')
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('school.form.foundedYear')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="1800" max={new Date().getFullYear()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            rules={{ required: t('school.validation.addressRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.address')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              rules={{ required: t('school.validation.cityRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('school.form.city')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              rules={{ required: t('school.validation.countryRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('school.form.country')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phoneNumber"
            rules={{ required: t('school.validation.phoneRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{ required: t('school.validation.emailRequired') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('school.form.email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                <span>{isEdit ? t('school.update.inProgress') : t('school.create.inProgress')}</span>
              </div>
            ) : (
              <span>{isEdit ? t('school.update.button') : t('school.create.button')}</span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
