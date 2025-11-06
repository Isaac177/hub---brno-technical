import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardBody, Image, Button, Chip } from '@nextui-org/react'
import { Calendar, Clock, Users, Star, Book, DollarSign } from 'lucide-react'
import { useGetCourseById } from '../../hooks/useGetCourses.js'
import { useGetCategories } from '../../hooks/useGetCategories.js'
import { useGetSchools } from '../../hooks/useGetSchools.js'

const SingleCourse = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const language = localStorage.getItem('i18nextLng') || 'ru'
    const { data: course, isLoading, isError } = useGetCourseById(id, language)
    const { data: categories } = useGetCategories(language)
    const { data: schools } = useGetSchools(language)

    const [category, setCategory] = useState(null)
    const [school, setSchool] = useState(null)

    useEffect(() => {
        if (course && categories && schools) {
            setCategory(categories.find(cat => cat.id === course.categoryId))
            setSchool(schools.find(sch => sch.id === course.schoolId))
        }
    }, [course, categories, schools])

    if (isLoading) {
        return <div className="text-center p-5 mt-3">Loading...</div>
    }

    if (isError || !course) {
        return (
            <div className="text-center p-5 mt-3">
                <h2 className="text-3xl text-primary-900 dark:text-primary-100">Course not found</h2>
            </div>
        )
    }

    console.log('course:', JSON.stringify(course, null, 2))

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8"
        >
            <Card className="mb-8">
                <CardBody>
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 mb-4 md:mb-0">
                            <Image
                                src={course.featuredImageUrl || `https://picsum.photos/400/300?random=${course.id}`}
                                alt={course.title}
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="md:w-2/3 md:pl-8">
                            <div className="flex justify-between items-center mb-4">
                                <Chip className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                                    {category?.name || 'Неизвестная категория'}
                                </Chip>
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                    <span className="text-sm">{course.averageRating?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-4">{course.title}</h1>
                            <p className="text-lg text-primary-700 dark:text-primary-300 mb-4">{course.description}</p>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span>Начало: {new Date(course.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span>Длительность: {course.durationInWeeks} недель</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span>Записалось: {course.enrollmentCount}</span>
                                </div>
                                <div className="flex items-center">
                                    <Book className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                                    <span>Уровень: {course.level}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-2xl font-bold text-green-600">{course.price ? `${course.price.toFixed(2)} ₸` : 'Цена не указана'}</p>
                                <Button color="primary" size="lg">Записаться</Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Содержание курса</h2>
            <Card className="mb-8">
                <CardBody>
                    <h3 className="text-xl font-semibold mb-2">Цели обучения</h3>
                    <ul className="list-disc pl-5 mb-4">
                        {course.learningObjectives?.map((objective, index) => (
                            <li key={index} className="text-primary-700 dark:text-primary-300">{objective}</li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold mb-2">Требования</h3>
                    <ul className="list-disc pl-5">
                        {course.prerequisites?.map((prerequisite, index) => (
                            <li key={index} className="text-primary-700 dark:text-primary-300">{prerequisite}</li>
                        ))}
                    </ul>
                </CardBody>
            </Card>

            <h2 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-4">Информация о школе</h2>
            <Card className="mb-8">
                <CardBody>
                    <div className="flex items-center mb-4">
                        <Image
                            src={school?.logoUrl || `https://picsum.photos/100/100?random=${course.schoolId}`}
                            alt={school?.name}
                            className="w-16 h-16 rounded-full mr-4"
                        />
                        <h3 className="text-xl font-semibold text-primary-900 dark:text-primary-100">{school?.name}</h3>
                    </div>
                    <p className="text-primary-700 dark:text-primary-300">{school?.description || 'Описание школы недоступно.'}</p>
                </CardBody>
            </Card>

            <div className="flex justify-between mt-8">
                <Button color="secondary" onClick={() => navigate(-1)}>Назад к курсам</Button>
                <Button color="primary" size="lg">Записаться</Button>
            </div>
        </motion.div>
    )
}

export default SingleCourse
