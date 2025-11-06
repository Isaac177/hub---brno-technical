import React, { useEffect, useState, useRef } from 'react'

const reviewsRussian = [
  {
    quote: "ybiraiHub - отличная онлайн-школа! Я многому научился за короткое время.",
    name: "Иван Петров",
    title: "Студент",
    image: "https://picsum.photos/seed/ivan/200"
  },
  {
    quote: "Преподаватели ybiraiHub очень профессиональны и всегда готовы помочь.",
    name: "Мария Сидорова",
    title: "Выпускница",
    image: "https://picsum.photos/seed/maria/200"
  },
  {
    quote: "Гибкий график обучения в ybiraiHub позволяет мне совмещать работу и учебу.",
    name: "Алексей Иванов",
    title: "Работающий студент",
    image: "https://picsum.photos/seed/alexey/200"
  },
  {
    quote: "Курсы ybiraiHub помогли мне сменить профессию и найти работу мечты.",
    name: "Елена Смирнова",
    title: "Выпускница, веб-разработчик",
    image: "https://picsum.photos/seed/elena/200"
  },
  {
    quote: "Удобная платформа и интерактивные занятия делают обучение в ybiraiHub увлекательным.",
    name: "Дмитрий Козлов",
    title: "Студент",
    image: "https://picsum.photos/seed/dmitry/200"
  }
]

const InfiniteMovingCards = ({ items, direction, speed, pauseOnHover }) => {
  const containerRef = useRef(null)
  const scrollerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children)
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true)
        scrollerRef.current.appendChild(duplicatedItem)
      })

      const animationDirection = direction === 'left' ? 'forwards' : 'reverse'
      containerRef.current.style.setProperty('--animation-direction', animationDirection)

      let animationDuration
      switch (speed) {
        case 'fast':
          animationDuration = '20s'
          break
        case 'normal':
          animationDuration = '40s'
          break
        case 'slow':
          animationDuration = '90s'
          break
        default:
          animationDuration = '80s'
      }
      containerRef.current.style.setProperty('--animation-duration', animationDuration)
    }
  }, [direction, speed])

  return (
    <div
      ref={containerRef}
      className="scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
    >
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap animate-scroll ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
          }`}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.name}-${idx}`}
            className="w-[350px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-700 px-8 py-6 md:w-[450px]"
            style={{
              background: 'linear-gradient(180deg, var(--slate-800), var(--slate-900))',
            }}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              <span className="relative z-20 text-sm leading-[1.6] text-black dark:text-white font-normal">
                {item.quote}
              </span>
              <div className="relative z-20 gap-4 mt-6 flex flex-row items-center">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-full mr-2" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm leading-[1.6] text-black dark:text-white font-normal">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] text-black dark:text-white font-normal">
                    {item.title}
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ReviewsSection = () => {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={reviewsRussian}
        direction="left"
        speed="slow"
        pauseOnHover={true}
      />
      <div className="mt-8">
        <InfiniteMovingCards
          items={reviewsRussian}
          direction="right"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
    </div>
  )
}

export default ReviewsSection