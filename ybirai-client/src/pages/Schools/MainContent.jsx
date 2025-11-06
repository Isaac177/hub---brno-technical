import Filter from '../../components/common/moderator.filter.jsx'
import { useGetSchools } from '../../hooks/useGetSchools.js'
import { LoaderCircle } from "lucide-react"
import { useAuth } from '../../contexts/AuthContext.jsx'
import SchoolsTable from "./SchoolsTable.jsx"
import EditSchoolForm from "./EditSchoolForm.jsx"
import { Modal, ModalContent, useDisclosure } from "@nextui-org/react"
import { useState } from "react"

export default function MainContent() {
	const { data: schools, isLoading, isError, error } = useGetSchools()
	const { user } = useAuth()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [selectedSchool, setSelectedSchool] = useState(null)

	const handleEditSchool = (schoolId) => {
		const school = schools.find(s => s.id === schoolId)
		setSelectedSchool(school)
		onOpen()
	}

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-96">
				<LoaderCircle size={64} className='text-primary animate-spin w-12 h-12' />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex justify-center items-center h-96">
				<p className="text-red-500">{error.message}</p>
			</div>
		)
	}

	const filteredSchools = schools.filter(school => school.email === user.email)

	return (
		<section className="grow p-4 flex flex-col gap-5 mb-10 md:mt-10 rounded-lg">
			<h2 className="text-3xl font-bold text-center">Школы</h2>
			<Filter placeholder={'Поиск школы'} />
			<SchoolsTable
				schools={filteredSchools}
				onEdit={handleEditSchool}
			/>

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="3xl"
			>
				<ModalContent>
					{selectedSchool && (
						<EditSchoolForm
							school={selectedSchool}
							onCancel={onClose}
						/>
					)}
				</ModalContent>
			</Modal>
		</section>
	)
}
