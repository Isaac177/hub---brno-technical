import React from 'react'
import Form from './Form'


export default function MainContent() {
	return (
		<section className="grow p-4 flex flex-col gap-5 mb-10 md:mt-10 rounded-lg bg-white dark:bg-dark-card">
			<h2 className='text-3xl font-bold text-center'>Школы</h2>
			<Form />
		</section>
	)
}
