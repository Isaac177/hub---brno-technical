import React from "react"
import { Link } from 'react-router-dom'

export default function Table({ data, tableType }) {
	return (
		<div className="w-full overflow-auto">
			<table className="min-w-full table-auto">
				<thead>
					<tr className="bg-blue-500">
						{tableType === "school" && (
							<>
								<th className="px-4 py-3 text-center text-white">Название школы</th>
								<th className="px-4 py-3 text-center text-white">Количество курсов</th>
								<th className="px-4 py-3 text-center text-white">Количество студентов</th>
								<th className="px-4 py-3 text-center text-white">Детали</th>
							</>
						)}
						{tableType === "course" && (
							<>
								<th className="px-4 py-3 text-center text-white">Название курсов</th>
								<th className="px-4 py-3 text-center text-white">Модули</th>
								<th className="px-4 py-3 text-center text-white">Количество студентов</th>
								<th className="px-4 py-3 text-center text-white">Детали</th>
							</>
						)}
						{tableType === "student" && (
							<>
								<th className="px-4 py-3 text-center text-white">Имя студента</th>
								<th className="px-4 py-3 text-center text-white">Почта</th>
								<th className="px-4 py-3 text-center text-white">Номер телефона</th>
								<th className="px-4 py-3 text-center text-white">Детали</th>
							</>
						)}
					</tr>
				</thead>
				<tbody>
					{data.map((row, index) => (
						<tr key={index} className="bg-white dark:bg-dark-card">
							{tableType === "school" && (
								<>
									<td className="px-4 py-5 text-center">{row.courses}</td>
									<td className="px-4 py-5 text-center">{row.students}</td>
									<td className="px-4 py-5 text-center">
										<button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl">
											Перейти
										</button>
									</td>
								</>
							)}
							{tableType === "course" && (
								<>
									<td className="px-4 py-5 text-center font-medium">{row.courseName}</td>
									<td className="px-4 py-5 text-center">{row.modules}</td>
									<td className="px-4 py-5 text-center">{row.students}</td>
									<td className="px-4 py-5 text-center">
										<button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl">
											Перейти
										</button>
									</td>
								</>
							)}
							{tableType === "request" && (
								<>
									<td className="px-4 py-5 text-center font-medium">{row.name}</td>
									<td className="px-4 py-5 text-center">{row.email}</td>
									<td className="px-4 py-5 text-center">{row.phone}</td>
									<td className="px-4 py-5 text-center">
										<Link to={'/moderator/student-requests/:id'} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl">
											Перейти
										</Link>
									</td>
								</>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
