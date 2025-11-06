import React from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

export default function TestCard() {
  return (
    <div className="w-full mx-auto bg-white dark:bg-[#1a1f2c] shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl flex-shrink-0 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Курс по обучению
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Школа - 8 занятий
            </p>
          </div>
          <Link
            to="/tests/id"
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out text-center"
          >
            Пройти тест
          </Link>
        </div>
        <div className="relative pt-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Время: 45 мин
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              0%
            </span>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
            <div
              style={{ width: "0%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-600 transition-all duration-500 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  )
}