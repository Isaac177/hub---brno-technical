import React, { createContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});

const SchoolCarousel = ({ items }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showControls = items.length > 1;

  useEffect(() => {
    checkScrollability();
  }, []);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index) => {
    setCurrentIndex(index);
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full cursor-pointer">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-20 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4 pl-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={`card${index}`}
                className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        {showControls && (
          <div className="flex justify-end gap-2 mr-10">
            <button
              className="relative z-40 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-50"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              ←
            </button>
            <button
              className="relative z-40 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center disabled:opacity-50"
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              →
            </button>
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  );
};

export default SchoolCarousel;
