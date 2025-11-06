import Hero from '../../components/header/Hero.jsx'
import Slider from "./school-slider/Slider.jsx"
import EducationSection from "./EducationSection.jsx"
import FaqComponent from "./RevsFAQ/FaqComponent.jsx"
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'

const pageVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(20px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    filter: 'blur(20px)',
  },
}

const pageTransition = {
  duration: 0.6,
  ease: 'easeInOut',
}

const Home = () => {
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();
  
  return (
    <motion.div
      className="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="flex flex-col min-h-screen bg-white-500 bg-gradient-to-t dark:from-[#000] dark:to-[#1D2332]">
        <div className="flex-grow flex flex-col items-center justify-center text-white dark:text-gray-100">
          <Hero />
        </div>
        <Slider />
        <EducationSection />
        <FaqComponent />
      </div>
    </motion.div>
  )
}

export default Home