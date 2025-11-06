import React from 'react'
import Article from './Article'
import CommentForm from './Comment.form'
import CommentSection from './CommentSection'

export default function MainContent({ data }) {
	return (
		<section className="bg-white dark:bg-[#0d1626] grow p-4 md:p-7 flex flex-col gap-5 mb-10 md:mt-20 rounded-lg shadow-sm">
			<Article key={data.id} article={data} />
			<CommentForm />
			<CommentSection />
		</section>
	)
}