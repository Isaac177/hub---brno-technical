import React from "react"
import HeaderSection from "./HeaderSection"
import ReviewsSection from "./ReviewsSection"
import ProfessionForm from "./ProfessionForm"
import FaqSection from "./FaqSection"
import { useLanguage } from "../../../contexts/LanguageContext"
import { useTranslation } from "react-i18next"

const FaqComponent = () => {
  const { currentLanguage } = useLanguage()
  const { t } = useTranslation()
  const faqItems = t("faq.items", { returnObjects: true })

  return (
    <div className="pb-8 md:pb-16 bg-gradient-to-t dark:from-[#000] dark:to-[#1D2332]">

      <HeaderSection />

      <ReviewsSection language={currentLanguage} />

      <ProfessionForm />

      <FaqSection
        title={t("faq.main")}
        faqData={Array.isArray(faqItems) ? faqItems : []}
        className="py-8 md:py-16 bg-gradient-to-t dark:from-[#000] dark:to-[#1D2332]"
      />
    </div>
  )
}

export default FaqComponent