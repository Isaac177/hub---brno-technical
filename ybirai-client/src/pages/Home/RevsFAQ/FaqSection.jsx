import React, { useState } from "react"

const FaqSection = ({ title, faqData }) => {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div className="px-4 md:px-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        {title}
      </h2>

      <div className="space-y-4">
        {faqData.map((item, idx) => (
          <div key={idx}>
            <div
              className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 shadow-md rounded-lg cursor-pointer"
              onClick={() => toggle(idx)}
            >
              <span className="text-base md:text-lg text-gray-900 dark:text-gray-100">
                {item.question}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transform transition-transform duration-200 ${
                  openIndex === idx ? "rotate-180" : ""
                } text-gray-600 dark:text-gray-400`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            <div
              className={`transition-max-height duration-500 ease-in-out overflow-hidden ${
                openIndex === idx ? "max-h-40 md:max-h-60" : "max-h-0"
              }`}
            >
              <div className="bg-gray-100 dark:bg-gray-700 p-4 shadow-inner rounded-lg mt-2 text-sm md:text-base text-gray-800 dark:text-gray-200">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FaqSection
