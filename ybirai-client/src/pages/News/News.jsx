import NewsHead from "./NewsHead.jsx"
import NewsGrid from "./NewsGrid.jsx"
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

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

  return (
    <motion.div
      className="page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to">
        <div className="flex-grow flex flex-col items-center justify-center">
          <NewsHead
            title={t('news.title')}
            description={t('news.description')}
          />
          <NewsGrid />
        </div>
      </div>
    </motion.div>
  )
}

export default Home