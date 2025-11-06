import Filter from '../../components/common/moderator.filter'
import Table from '../../components/common/moderator.table'
import { useTranslation } from 'react-i18next'

export default function MainContent() {
  const { t } = useTranslation();
  
  const students = [
    { name: "Альтаир", email: "email@gmail.com", phone: "+ 7 707 777 77 77" },
    { name: "Альтаир", email: "email@gmail.com", phone: "+ 7 707 777 77 77" },
  ]

  return (
    <section className="grow p-4 flex flex-col gap-5 mb-10 md:mt-10 rounded-lg">
      <h2 className="text-3xl font-bold text-center">{t('students.title')}</h2>
      <Filter placeholder={t('students.searchPlaceholder')} />
      <Table data={students} tableType={'student'} />
    </section>
  )
}
