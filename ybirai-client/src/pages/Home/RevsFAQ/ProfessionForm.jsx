import React, { useState } from "react"
import { useTranslation } from 'react-i18next';

const ProfessionForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errors, setErrors] = useState({})

  const sanitizeInput = (value) => {
    return value.trim().replace(/[<>'"]/g, '')
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = t('professionForm.nameError')
    }
    
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('professionForm.phoneError')
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = t('professionForm.emailError')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendToTelegram = async (data) => {
    const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram configuration missing')
    }

    const message = `🎓 New Professional Course Request

👤 Name: ${data.name}
📞 Phone: ${data.phone}
📧 Email: ${data.email}
🕐 Time: ${new Date().toLocaleString()}`

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await sendToTelegram(formData)
      setSubmitStatus('success')
      setFormData({ name: "", phone: "", email: "" })
    } catch (error) {
      console.error('Error sending form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('professionForm.title')}
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          {t('professionForm.description')}
        </p>
        
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-500 dark:bg-green-600 rounded-lg">
            <p className="font-semibold">{t('professionForm.successMessage')}</p>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500 dark:bg-red-600 rounded-lg">
            <p className="font-semibold">{t('professionForm.errorMessage')}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                name="name"
                placeholder={t('professionForm.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 border-2 transition-colors ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-transparent focus:border-blue-300 dark:focus:border-blue-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-200 text-sm text-left">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="tel"
                name="phone"
                placeholder={t('professionForm.phonePlaceholder')}
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 border-2 transition-colors ${
                  errors.phone 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-transparent focus:border-blue-300 dark:focus:border-blue-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-200 text-sm text-left">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder={t('professionForm.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 border-2 transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-600' 
                    : 'border-transparent focus:border-blue-300 dark:focus:border-blue-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-200 text-sm text-left">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-white dark:bg-gray-200 text-blue-600 dark:text-blue-700 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    {t('professionForm.submitting')}
                  </div>
                ) : (
                  t('professionForm.submitButton')
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfessionForm