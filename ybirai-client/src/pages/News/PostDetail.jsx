import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { FaHeart, FaEye, FaUser, FaHome, FaAngleRight } from "react-icons/fa"
import NewsPostHead from "./NewsPostHead.jsx"

const PostDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { post } = location.state || {}

  if (!post) {
    return (
      <div className="w-full max-w-screen-lg bg-white dark:bg-gray-900 min-h-screen transition-all duration-300 mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/${i18n.language}/news`)}
          className="mb-4 text-blue-500 dark:text-blue-400 hover:underline"
        >
          &larr; {t('news.error.goBack')}
        </button>
        <div className="text-gray-500 dark:text-gray-400">{t('news.error.postNotFound')}</div>
      </div>
    )
  }

  const placeholderDate = "21.07.2024"
  const placeholderViews = "1234"
  const placeholderLikes = post.likes.length

  return (
    <>
      <NewsPostHead />
      <div className="md:my-10 w-full max-w-screen-xl bg-gradient-to-br from-light-from to-light-to dark:from-dark-from dark:to-dark-to min-h-screen transition-all duration-300 mx-auto px-4 py-8">
        <div className="flex items-center text-blue-500 dark:text-blue-400 text-md mb-4 space-x-1">
          <button onClick={() => navigate(`/${i18n.language}`)} className="flex items-center">
            <FaHome className="mr-1" />
            {t('common.home')}
          </button>

          <FaAngleRight className="mx-1 text-gray-500 dark:text-gray-400" />

          <button onClick={() => navigate(`/${i18n.language}/news`)}>{t('common.news')}</button>

          <FaAngleRight className="mx-1 text-gray-500 dark:text-gray-400" />

          <span className="text-gray-500 dark:text-gray-400">
            {post.title.length > 15
              ? `${post.title.slice(0, 15)}...`
              : post.title}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        <div className="flex flex-row items-center justify-between text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6 md:mb-14 space-x-4">
          <span>{placeholderDate}</span>
          <div className="flex items-center">
            <FaEye className="text-blue-500 dark:text-blue-400 mr-2" />
            <span>{placeholderViews}</span>
          </div>
          <div className="flex items-center">
            <FaHeart className="text-red-500 dark:text-red-400 mr-2" />
            <span>{placeholderLikes}</span>
          </div>
        </div>

        <div className="relative w-full max-w-full md:max-w-screen-md lg:max-w-screen-xl mx-auto h-[20rem] md:h-[25rem] mb-14 ">
          <img
            src={`https://picsum.photos/seed/${post.id}/800/600`}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl"
          />
          <div className="relative flex justify-center items-center w-full h-full z-10">
            <img
              src={`https://picsum.photos/seed/${post.id}/800/600`}
              alt={post.title}
              className="object-contain max-w-full max-h-full rounded-lg"
            />
          </div>
        </div>

        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-12">{post.content}</p>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Добавить комментарий..."
            className="w-full p-3 md:p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm">
          {post.commentList.length > 0 ? (
            <ul className="space-y-4">
              {post.commentList.map((comment) => (
                <li key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    <FaUser className="mr-2" />
                    <span>{comment.userEmail}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Комментариев пока нет.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default PostDetail