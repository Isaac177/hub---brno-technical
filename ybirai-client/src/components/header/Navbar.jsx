import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Cpu, Settings, LogOut, GraduationCap, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserData } from "../../contexts/UserContext.jsx";
import { useGetUserByEmail } from "../../hooks/useGetUserByEmail.js";
import { useTranslation } from "react-i18next";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { authService } from "../../services/authService.js";
import useDarkMode from "../hooks/useDarkMode.js";
import logoImage from "../../assets/logo2.png";
import ToggleTheme from "../general/ThemeToggle.jsx";
import LanguageSelector from "../common/LanguageSelector";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, session, clearAuthState, userSub } = useAuth();
  const { data: userData } = useGetUserByEmail();
  const { t } = useTranslation();
  const { displayLanguage } = useLanguage();

  const userEmail = session?.tokens?.idToken?.payload?.email;
  const userName = session?.tokens?.idToken?.payload?.name;
  const role = userData?.role?.toUpperCase() || "";

  const getEducationPath = () => {
    if (!userSub) return `/${displayLanguage}`;

    switch (role) {
      case "PLATFORM_ADMIN":
        return `/${displayLanguage}/${userSub}/super/education`;
      case "SCHOOL_ADMIN":
        return `/${displayLanguage}/${userSub}/admin/education/schools`;
      case "STUDENT":
        return `/${displayLanguage}/${userSub}/student/education`;
      default:
        return `/${displayLanguage}/${userSub}/education`;
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      clearAuthState();
      navigate(`/${displayLanguage}/login`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navItems = [
    { name: t("common.home"), path: `/${displayLanguage}` },
    { name: t("common.news"), path: `/${displayLanguage}/news` },
    { name: t("common.forum"), path: `/${displayLanguage}/forum` },
    { name: t("common.catalog"), path: `/${displayLanguage}/catalog` },
  ];

  const isActive = (path) => {
    return (
      (path === `/${displayLanguage}` && pathname === `/${displayLanguage}`) ||
      (path !== `/${displayLanguage}` && pathname.startsWith(path))
    );
  };

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="bg-blue-500 bg-opacity-95"
      maxWidth="full"
      isBordered
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle className="text-white" />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <img src={logoImage} alt="Logo" className="w-32" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex" justify="start">
        <NavbarBrand>
          <img src={logoImage} alt="Logo" className="w-40" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.path} isActive={isActive(item.path)}>
            <Link
              to={item.path}
              className="text-white flex items-center text-xl"
            >
              {isActive(item.path) && (
                <Cpu className="mr-2 w-6 h-6 animate-spin-slow" />
              )}
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4">
        <LanguageSelector />
        <ToggleTheme />
        {isSignedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar>
                  <AvatarImage src="" alt={userName || userEmail} />
                  <AvatarFallback>
                    {(userName || userEmail)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-s leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div
                  onClick={() => {
                    const path = getEducationPath();
                    console.log("Navigating to:", path);
                    navigate(path);
                  }}
                  className="flex items-center cursor-pointer"
                >
                  {role === "STUDENT" ? (
                    <>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>{t("common.education")}</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="mr-2 h-4 w-4" />
                      <span>{t("common.dashboard")}</span>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
                <Link to={`/${userSub}/profile`} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/${userSub}/profile/edit`} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem> */}
              {role === "PLATFORM_ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link
                    to={`/${displayLanguage}/${userSub}/platform_admin/blog-management`}
                    className="flex items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("common.blogManagement")}</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("common.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden sm:flex gap-3">
            <Button
              className="
    bg-[var(--primary-100)]
    hover:bg-[var(--primary-200)]
    dark:bg-[var(--primary-200)]
    dark:hover:bg-[var(--primary-100)]
    transition-colors duration-200
  "
              variant="outline"
              asChild
            >
              <Link to={`/${displayLanguage}/login`}>{t("common.login")}</Link>
            </Button>
            <Button
              className="
    bg-[var(--primary-100)]
    hover:bg-[var(--primary-200)]
    dark:bg-[var(--primary-200)]
    dark:hover:bg-[var(--primary-100)]
    transition-colors duration-200
  "
              variant="outline"
              asChild
            >
              <Link to={`/${displayLanguage}/register`}>
                {t("common.register")}
              </Link>
            </Button>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu className="bg-blue-500 bg-opacity-95 pt-6">
        {navItems.map((item) => (
          <NavbarMenuItem key={item.path}>
            <Link
              to={item.path}
              className={`text-white text-xl ${isActive(item.path) ? "font-bold" : ""
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isActive(item.path) && (
                <Cpu className="mr-2 w-6 h-6 animate-spin-slow inline" />
              )}
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {!isSignedIn && (
          <NavbarMenuItem className="flex flex-col gap-2 mt-8">
            <Button
              className="
    bg-[var(--primary-100)]
    hover:bg-[var(--primary-200)]
    dark:bg-[var(--primary-200)]
    dark:hover:bg-[var(--primary-100)]
    transition-colors duration-200
    text-black dark:text-white
  "
              variant="outline"
              asChild
            >
              <Link
                to={`/${displayLanguage}/login`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("common.login")}
              </Link>
            </Button>
            <Button
              className="
    bg-[var(--primary-100)]
    hover:bg-[var(--primary-200)]
    dark:bg-[var(--primary-200)]
    dark:hover:bg-[var(--primary-100)]
    transition-colors duration-200
    text-black dark:text-white
  "
              variant="outline"
              asChild
            >
              <Link
                to={`/${displayLanguage}/register`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t("common.register")}
              </Link>
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </NextUINavbar>
  );
}
