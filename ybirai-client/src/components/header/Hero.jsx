import React from "react";
import { useTranslation } from "react-i18next";
import lightsImage from "../../assets/lights.png";
import starImage from "../../assets/star.png";
import teach2Image from "../../assets/teach2.png";

import img1 from "../../assets/1.png";
import img2 from "../../assets/2.png";
import img3 from "../../assets/3.png";
import img5 from "../../assets/5.png";
import img6 from "../../assets/6.png";
import img7 from "../../assets/7.png";
import img8 from "../../assets/8.png";
import img9 from "../../assets/9.png";
import img10 from "../../assets/10.png";
import img11 from "../../assets/11.png";
import img12 from "../../assets/12.png";
import img13 from "../../assets/13.png";
import img14 from "../../assets/14.png";
import img15 from "../../assets/15.png";

const Hero = () => {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === "ru";

  const lightsMobileDefault = "top-[-1.4rem] left-[-1.4rem]";
  const starMobileDefault = "top-[1.7rem]  right-[-1.2rem]";

  const lightsMobileRu = "top-[-35%]  left-[8%]";
  const starMobileRu = "top-[3.5rem]   right-[27%]";

  const lightsDesktop = "md:top-[-2rem] md:left-[-2rem]";
  const starDesktop = "md:top-[4rem]  md:right-[-2rem]";

  return (
    <div className="relative h-[40vh] md:h-[95vh] flex overflow-visible w-full bg-gradient-to-b from-blue-500 to-blue-700">
      <div className="flex flex-col text-white z-10 w-full">
        <div className="text-center z-10 mt-10 relative inline-block overflow-visible">
          <h1 className="text-3xl md:text-7xl font-bold text-white mb-4 relative inline-block">
            {t("hero.title")}
            <img
              src={lightsImage}
              alt="Lights"
              className={`
          absolute
          ${isRu ? lightsMobileRu : lightsMobileDefault}
          ${lightsDesktop}
          w-8 md:w-12 h-8 md:h-12
          z-0
        `}
            />

            <img
              src={starImage}
              alt="Star"
              className={`
          absolute
          ${isRu ? starMobileRu : starMobileDefault}
          ${starDesktop}
          w-5 md:w-7 h-5 md:h-7
          z-0
        `}
            />
          </h1>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30 overflow-visible w-full md:w-[90%]">
          <img
            src={teach2Image}
            alt="Student encouraging learning"
            className="w-full h-full object-contain"
          />

          <button 
            onClick={() => document.getElementById('educationSection')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-[10px] md:bottom-[30px] left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-l md:text-3xl px-8 md:px-16 py-1 md:py-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg z-20"
          >
            {t("hero.button")}
          </button>
        </div>

        {[
          { src: img1, style: "top-[10%] left-[8%]" },
          { src: img2, style: "top-[30%] right-[92%]" },
          { src: img3, style: "bottom-[12%] left-[10%]" },
          { src: img9, style: "top-[10%] left-[18%]" },
          { src: img5, style: "bottom-[55%] right-[78%]" },
          { src: img6, style: "top-[60%] left-[5%]" },
          { src: img7, style: "bottom-[15%] right-[5%]" },
          { src: img8, style: "top-[15%] right-[22%]" },
          { src: img9, style: "bottom-[20%] left-[22%]" },
          { src: img10, style: "top-[10%] right-[8%]" },
          { src: img11, style: "bottom-[20%] right-[15%]" },
          { src: img12, style: "top-[50%] right-[75%]" },
          { src: img13, style: "bottom-[55%] right-[30%]" },
          { src: img14, style: "top-[55%] right-[12%]" },
          { src: img15, style: "bottom-[50%] right-[20%]" },
        ].map((icon, index) => (
          <img
            key={index}
            src={icon.src}
            alt={`Icon ${index + 1}`}
            className={`absolute opacity-40 z-20 ${icon.style} w-8 md:w-16 h-8 md:h-16`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
