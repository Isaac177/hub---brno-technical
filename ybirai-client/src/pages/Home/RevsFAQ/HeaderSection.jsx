import React from "react"
import { useTranslation } from 'react-i18next';
import group14Image from '../../../assets/group14.png'


const HeaderSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-900 dark:bg-gray-800 flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 px-4 md:px-8">
      <div className="text-white md:w-1/2 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 mt-8">
          {t('headerSection.title')}
        </h1>
      </div>
      <div className="mt-6 md:mt-0 md:ml-4 md:w-1/2 flex justify-center">
        <img
          src={group14Image}
          alt="Group 14"
          className="w-full h-auto max-w-md"
        />
      </div>
    </div>
  )
}

export default HeaderSection