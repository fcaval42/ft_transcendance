import { UserAvatar } from "../utils/userAvatar";
import { LogoutButton } from "./LougoutButton";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

export const Header = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "fr", label: "🇫🇷 FR" },
    { code: "en", label: "🇬🇧 EN" },
    { code: "es", label: "🇪🇸 ES" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <header className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <UserAvatar />
        <LogoutButton />
      </header>

    <div className="absolute top-16 right-4 z-50">
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-indigo-400 hover:bg-pink-400 text-white border border-slate-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center gap-2"
            >
              {currentLang.label}
              <span className="text-xs">▼</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-full bg-indigo-400 border border-slate-700 rounded-md shadow-lg overflow-hidden z-20">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-pink-400 cursor-pointer transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
    </>
  );
};

export const HeaderLogout = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "fr", label: "🇫🇷 FR" },
    { code: "en", label: "🇬🇧 EN" },
    { code: "es", label: "🇪🇸 ES" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute top-4 right-4 z-50">
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-indigo-400 hover:bg-pink-400 text-white border border-slate-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex items-center gap-2"
        >
          {currentLang.label}
          <span className="text-xs">▼</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-full bg-indigo-400 border border-slate-700 rounded-md shadow-lg overflow-hidden z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-pink-400 cursor-pointer transition-colors"
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};