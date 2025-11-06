import React, { createContext, useContext, useState } from "react"

const SchoolContext = createContext()

export function SchoolProvider({ children }) {
  const [selectedSchool, setSelectedSchool] = useState(null)

  const value = {
    selectedSchool,
    setSelectedSchool,
  }

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  )
}

export const useSchool = () => {
  const context = useContext(SchoolContext)
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider")
  }
  return context
}
