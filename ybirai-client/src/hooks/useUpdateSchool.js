import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../utils/apiService"

export function useUpdateSchool() {
  const queryClient = useQueryClient()

  const updateSchool = async ({ id, request, logo }) => {
    if (!id) {
      throw new Error("School ID is required")
    }

    const formData = new FormData()

    const cleanRequest = {
      name: request.name,
      description: request.description,
      website: request.website,
      foundedYear: request.foundedYear,
      address: request.address,
      city: request.city,
      country: request.country,
      phoneNumber: request.phoneNumber,
      email: request.email,
      primaryContactEmail: request.email,
      status: request.status
    }

    const blob = new Blob([JSON.stringify(cleanRequest)], {
      type: 'application/json'
    })

    formData.append("request", blob)

    for (let pair of formData.entries()) {
      console.log(`  ${pair[0]}:`, pair[1]);
      if (pair[1] instanceof Blob) {
        const text = await pair[1].text();
      }
    }

    if (logo instanceof File) {
      formData.append("logo", logo)
    }

    const response = await apiService.user.put(`/school/${id}`, formData, 'en');

    return response;
  }

  return useMutation({
    mutationFn: updateSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
    },
  })
}
