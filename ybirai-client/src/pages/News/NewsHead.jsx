import { useTranslation } from 'react-i18next'
import img1 from '../../assets/1.png'
import img2 from '../../assets/2.png'
import img3 from '../../assets/3.png'
import img5 from '../../assets/5.png'
import img6 from '../../assets/6.png'
import img7 from '../../assets/7.png'
import img8 from '../../assets/8.png'
import img9 from '../../assets/9.png'
import img10 from '../../assets/10.png'
import img11 from '../../assets/11.png'

const NewsHead = ({ title, description, image }) => {
  const { t } = useTranslation()

  const icons = [
    {
      src: img1,
      mobileStyle: "top-[10%] left-[5%]",
      desktopStyle: "md:top-[20%] md:left-[8%]",
    },
    {
      src: img2,
      mobileStyle: "top-[30%] right-[5%]",
      desktopStyle: "md:top-[50%] md:right-[10%]",
    },
    {
      src: img3,
      mobileStyle: "bottom-[10%] left-[5%]",
      desktopStyle: "md:bottom-[12%] md:left-[10%]",
    },
    {
      src: img9,
      mobileStyle: "top-[5%] left-[15%]",
      desktopStyle: "md:top-[10%] md:left-[18%]",
    },
    {
      src: img5,
      mobileStyle: "bottom-[50%] right-[5%]",
      desktopStyle: "md:bottom-[55%] md:right-[5%]",
    },
    {
      src: img6,
      mobileStyle: "top-[55%] left-[5%]",
      desktopStyle: "md:top-[60%] md:left-[5%]",
    },
    {
      src: img7,
      mobileStyle: "bottom-[10%] right-[5%]",
      desktopStyle: "md:bottom-[15%] md:right-[5%]",
    },
    {
      src: img8,
      mobileStyle: "top-[60%] right-[40%]",
      desktopStyle: "md:top-[65%] md:right-[62%]",
    },
    {
      src: img9,
      mobileStyle: "top-[10%] right-[30%]",
      desktopStyle: "md:top-[15%] md:right-[52%]",
    },
    {
      src: img10,
      mobileStyle: "top-[30%] right-[50%]",
      desktopStyle: "md:top-[35%] md:right-[72%]",
    },
    {
      src: img11,
      mobileStyle: "top-[10%] right-[20%]",
      desktopStyle: "md:top-[15%] md:right-[42%]",
    },
  ]

  return (
    <div className="relative h-[45vh] md:h-[65vh] flex flex-col md:flex-row items-center justify-between w-full bg-gradient-to-b from-blue-500 to-blue-700 p-4 md:p-8">
      <div className="flex flex-col text-white w-full md:w-1/2 text-center md:text-left">
        <div className="mb-6 md:mb-12 relative pt-10 md:pt-0">
          <h1 className="text-4xl md:text-7xl font-bold relative inline-block mb-4 md:mb-8 pl-0 md:pl-20">
            {t('news.title')}
            <img
              src="/lights.png"
              alt="Lights"
              className="absolute top-[-1.5rem] md:top-[-2rem] left-[-5%] md:left-[3rem] transform -translate-x-1/2 md:translate-x-0 w-8 h-8 md:w-12 md:h-12 z-0"
            />
            <img
              src="/star.png"
              alt="Star"
              className="absolute top-[2rem] md:top-[4rem] right-[-1.5rem] md:right-[-2rem] w-5 h-5 md:w-7 md:h-7 z-0"
            />
          </h1>
          <p className="text-xl md:text-2xl pl-0 md:pl-20 px-2 md:px-0">
            {t('news.description')}
          </p>
        </div>
      </div>

      <div className="absolute md:relative bottom-5 w-[60%] md:w-1/2 mt-8 md:mt-0 flex justify-center overflow-hidden h-[40vh] md:h-auto">
        <img
          src={image || "/newsStudents.png"}
          alt={title}
          className="w-full max-w-xs md:max-w-md h-auto object-contain object-bottom hidden md:block"
        />
      </div>

      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon.src}
          alt={`Icon ${index + 1}`}
          className={`absolute opacity-40 z-20 ${icon.mobileStyle} ${icon.desktopStyle} w-8 h-8 md:w-16 md:h-16`}
        />
      ))}
    </div>
  )
}

export default NewsHead