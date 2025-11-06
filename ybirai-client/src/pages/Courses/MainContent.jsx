import Filter from '../../components/common/moderator.filter'
import Table from '../../components/common/moderator.table'
import { useTranslation } from 'react-i18next'

export default function MainContent() {
	const { t } = useTranslation();
	const courses = [
		{
			courseName: "Python обучение",
			modules: 5,
			students: 120,
		},
		{
			courseName: "Web разработка",
			modules: 7,
			students: 200,
		},
		{
			courseName: "Data Science",
			modules: 6,
			students: 150,
		},
		{
			courseName: "Machine Learning",
			modules: 8,
			students: 180,
		},
		{
			courseName: "Mobile Development",
			modules: 4,
			students: 90,
		},
		{
			courseName: "Digital Marketing",
			modules: 3,
			students: 75,
		},
		{
			courseName: "UI/UX Дизайн",
			modules: 5,
			students: 110,
		},
		{
			courseName: "JavaScript Программирование",
			modules: 6,
			students: 220,
		},
		{
			courseName: "Бизнес Аналитика",
			modules: 4,
			students: 85,
		},
		{
			courseName: "Основы кибербезопасности",
			modules: 6,
			students: 130,
		},
	]

	return (
		<section className="grow p-4 flex flex-col gap-5 mb-10 md:mt-10 rounded-lg">
			<h2 className="text-3xl font-bold text-center">{t('courses')}</h2>
			<Filter placeholder={t('search_school')} />
			<Table data={courses} tableType={'course'} />
		</section>
	)
}
