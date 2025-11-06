import lightsImage from '../../assets/lights.png'
import starImage from '../../assets/star.png'

export default function Header() {
  return (
    <header className="flex flex-col h-[200px] md:h-[320px] bg-forum-gradient-p3 dark:bg-dark-forum-gradient-p3 py-4 md:py-7 font-medium absolute top-0 left-0 right-0">
      <div className="flex flex-col items-center pt-10 md:pt-20 text-white gap-3 md:gap-5">
        <h1 className="text-3xl md:text-[56px] font-bold mt-4 max-[768px]:mt-9 relative">
          Форум
          <img
            src={ lightsImage }
            alt="Lights"
            className="absolute top-[-2.5rem] left-[-1.9rem] w-12 h-12 z-0 max-[768px]:w-9 max-[768px]:h-9 max-[768px]:top-[-1.5rem]"
          />
          <img
            src={ starImage }
            alt="Star"
            className="absolute top-[1.9rem] right-[-2rem] w-7 h-7 z-0 max-[768px]:w-5 max-[768px]:h-5 max-[768px]:top-[1.5rem]"
          />
        </h1>
        <p className="text-lg md:text-3xl font-semibold mb-8 mt-8 max-[768px]:mt-5">
          Добро пожаловать на Форум!
        </p>
      </div>
    </header>
  )
}
