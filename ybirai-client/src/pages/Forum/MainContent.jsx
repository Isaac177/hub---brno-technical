import React from 'react'
import Article from './Article'
import { useTranslation } from 'react-i18next'

export default function MainContent({ data }) {
	const { t } = useTranslation()

	if (!data.main || data.main.length === 0) {
		return (
			<section className="bg-white dark:bg-[#0d1626] grow p-4 md:p-7 flex flex-col gap-5 mb-10 rounded-lg shadow-sm">
				<div className="text-center py-8">
					<p className="text-muted-foreground">{t('forum.noDiscussions')}</p>
				</div>
			</section>
		)
	}

	return (
		<section className="bg-white dark:bg-[#0d1626] grow p-4 md:p-7 flex flex-col gap-5 mb-10 rounded-lg shadow-sm">
			{data.main.map(article => (
				<Article key={article.id} article={article} />
			))}
		</section>
	)
}