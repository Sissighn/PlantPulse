// "use client"
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Menu({
  trigger,
  children,
  align = "left",
  showChevron = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
        {showChevron && (
          <ChevronDown
            className="ml-2 -mr-1 h-4 w-4 text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          />
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-56 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black dark:ring-slate-700 ring-opacity-9 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
}) {
  return (
    <button
      className={`relative block w-full h-10 text-center group
        ${
          disabled
            ? "text-slate-400 dark:text-slate-500 cursor-not-allowed"
            : "text-slate-600 dark:text-slate-300"
        }
        ${isActive ? "bg-white/10" : ""}
      `}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center justify-center h-full">
        {icon && (
          <span className="h-5 w-5 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
            {icon}
          </span>
        )}
        {children}
      </span>
    </button>
  );
}

export function MenuContainer({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenArray = React.Children.toArray(children);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative w-[40px]" data-expanded={isExpanded} ref={menuRef}>
      <div className="relative">
        {/* Trigger button (first child) */}
        <div
          className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 cursor-pointer rounded-full group will-change-transform z-50 flex items-center justify-center"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {/* Expanded items (remaining children) */}
        {childrenArray.slice(1).map((child, index) => (
          <div
            key={index}
            className="absolute top-0 left-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 will-change-transform flex items-center justify-center"
            style={{
              transform: `translateY(${isExpanded ? (index + 1) * 44 : 0}px)`,
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
              zIndex: 40 - index,
              clipPath:
                index === childrenArray.length - 2
                  ? "circle(50% at 50% 50%)"
                  : "circle(50% at 50% 55%)",
              transition: `transform ${
                isExpanded ? "300ms" : "300ms"
              } cubic-bezier(0.4, 0, 0.2, 1),
                         opacity ${isExpanded ? "300ms" : "350ms"}`,
              backfaceVisibility: "hidden",
              perspective: 1000,
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * LanguageMenuItem — Globe button that fits inside MenuContainer.
 *
 * The dropdown is rendered via a React Portal directly into document.body,
 * so it is never clipped by the parent's clipPath or overflow.
 */
export function LanguageMenuItem() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Recalculate position whenever the dropdown opens
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        // Place dropdown to the LEFT of the button, vertically centred
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX - 72, // 72px ≈ dropdown width
      });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  const currentLang = i18n.language?.slice(0, 2).toUpperCase() || "DE";

  return (
    <div className="flex items-center justify-center w-10 h-10">
      {/* Globe trigger */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        title={`Language: ${currentLang}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Globe className="w-5 h-5" />
      </button>

      {/* Dropdown rendered in body via Portal — not clipped by clipPath */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
            }}
            className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 min-w-[68px]"
            role="menu"
          >
            {["de", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleChange(lang)}
                className={`block w-full px-4 py-2.5 text-sm font-semibold transition-colors
                  ${
                    i18n.language?.startsWith(lang)
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                role="menuitem"
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
