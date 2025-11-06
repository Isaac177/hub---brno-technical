import React from "react";
import { Switch, VisuallyHidden, useSwitch } from "@nextui-org/react";
import useDarkMode from "../hooks/useDarkMode";
import { SunIcon } from "../icons/SunIcon.jsx";
import { MoonIcon } from "../icons/MoonIcon.jsx";
import { useTranslation } from "react-i18next";

const ToggleTheme = (props) => {
  const darkMode = useDarkMode();
  const { t } = useTranslation();

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    ...props,
    isSelected: darkMode.value,
    onValueChange: () => darkMode.toggle(),
  });

  return (
    <Component {...getBaseProps()}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: [
            "w-8 h-8",
            "flex items-center justify-center",
            "rounded-lg bg-blue hover:bg-white/35",
            "transition-colors duration-200",
          ],
        })}
        aria-label={
          darkMode.value ? t("common.lightMode") : t("common.darkMode")
        }
      >
        {isSelected ? <SunIcon /> : <MoonIcon />}
      </div>
    </Component>
  );
};

export default ToggleTheme;
