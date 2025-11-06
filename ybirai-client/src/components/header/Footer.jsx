import img11 from '../../assets/11.png'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation();
  
  const stars = [
    { id: 1, top: "10%", left: "20%" },
    { id: 2, top: "15%", left: "50%" },
    { id: 3, top: "25%", left: "70%" },
    { id: 4, top: "35%", left: "10%" },
    { id: 5, top: "40%", left: "80%" },
    { id: 6, top: "50%", left: "30%" },
    { id: 7, top: "55%", left: "60%" },
    { id: 8, top: "60%", left: "15%" },
    { id: 9, top: "70%", left: "45%" },
    { id: 10, top: "75%", left: "75%" },
    { id: 11, top: "80%", left: "20%" },
    { id: 12, top: "85%", left: "50%" },
    { id: 13, top: "90%", left: "30%" },
    { id: 14, top: "95%", left: "70%" },
    { id: 15, top: "98%", left: "10%" },
  ]

  return (
    <footer className="bg-gradient-to-t from-blue-500 to-blue-700 dark:from-[#000] dark:to-[#1D2332] border-t-black border-t dark:border-white text-white py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <img
            key={star.id}
            src={img11}
            alt={t('footer.starAlt')}
            className="absolute w-4 h-4 hidden dark:block"
            style={{
              top: star.top,
              left: star.left,
              transform: `rotate(${star.id * 15}deg)`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 relative">
        <div className="space-y-4">
          <h4 className="text-lg font-bold">{t('footer.navigation.title')}</h4>
          <a href="#" className="block hover:text-gray-300">
            {t('footer.navigation.aboutUs')}
          </a>
          <a href="#" className="block hover:text-gray-300">
            {t('footer.navigation.contacts')}
          </a>
          <a href="#" className="block hover:text-gray-300">
            {t('footer.navigation.aboutSite')}
          </a>
          <a href="#" className="block hover:text-gray-300">
            {t('footer.navigation.mission')}
          </a>
          <a href="#" className="block hover:text-gray-300">
            {t('footer.navigation.payment')}
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold">{t('footer.contacts.title')}</h4>
          <p>{t('footer.contacts.address')}</p>
          <p>{t('footer.contacts.phone')}</p>
          <a href="mailto:Onlinekz@school.org" className="hover:text-gray-300">
            {t('footer.contacts.email')}
          </a>
          <p>{t('footer.contacts.hours')}</p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-bold">{t('footer.social.title')}</h4>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300 flex items-center space-x-2"
          >
            <span>Instagram</span>
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300 flex items-center space-x-2"
          >
            <span>TikTok</span>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-300 flex items-center space-x-2"
          >
            <span>Youtube</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
