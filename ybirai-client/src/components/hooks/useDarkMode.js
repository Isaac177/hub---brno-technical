import { useEffect } from "react"
import useLocalStorage from "./useLocalStorage"

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)

    const onStorage = (e) => {
      if (e.key === "darkMode") {
        setDarkMode(e.newValue === "true")
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [darkMode, setDarkMode])

  return {
    value: darkMode,
    enable: () => setDarkMode(true),
    disable: () => setDarkMode(false),
    toggle: () => setDarkMode((prev) => !prev),
  }
}

export default useDarkMode
