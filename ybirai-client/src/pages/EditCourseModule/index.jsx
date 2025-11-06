import React from 'react'
import MainContent from './MainContent.jsx'

export default function EditCourseModule() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
			<main className="w-full">
				<div className="container mx-auto px-4 md:px-5">
					<div className="flex flex-col md:flex-row md:gap-10 md:items-start">
						<MainContent />
					</div>
				</div>
			</main>
		</div>
	)
}
