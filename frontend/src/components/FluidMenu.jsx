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
  label = "Menu",
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

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        aria-label={label}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer inline-flex items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
        type="button"
      >
        {trigger}
        {showChevron && (
          <ChevronDown
            className="ml-2 -mr-1 h-4 w-4 text-slate-500 dark:text-slate-400"
            aria-hidden="true"
          />
        )}
      </button>

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
  title,
  ariaLabel,
  tabIndex,
}) {
  const label = ariaLabel || title;
  const content = (
    <span className="flex items-center justify-center h-full">
      {icon && (
        <span className="h-5 w-5 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">
          {React.cloneElement(icon, { "aria-hidden": true })}
        </span>
      )}
      {children}
    </span>
  );

  if (!onClick) {
    return (
      <span
        aria-hidden="true"
        className={`relative block w-full h-10 text-center group ${
          disabled
            ? "text-slate-400 dark:text-slate-500"
            : "text-slate-600 dark:text-slate-300"
        } ${isActive ? "bg-white/10" : ""}`}
        title={title}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      aria-label={label}
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
      tabIndex={tabIndex}
      title={title}
      type="button"
    >
      {content}
    </button>
  );
}

export function MenuContainer({ children, label = "More actions" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenArray = React.Children.toArray(children);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsExpanded(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="relative w-[clamp(2.35rem,8vw,2.85rem)]"
      data-expanded={isExpanded}
      ref={menuRef}
    >
      <div className="relative">
        <button
          aria-expanded={isExpanded}
          aria-label={label}
          aria-haspopup="menu"
          className="pp-icon-button relative z-50 cursor-pointer group will-change-transform"
          onClick={handleToggle}
          ref={triggerRef}
          type="button"
        >
          {childrenArray[0]}
        </button>

        <div aria-label={label} role="menu">
          {childrenArray.slice(1).map((child, index) => {
            const menuChild = React.isValidElement(child)
              ? React.cloneElement(child, {
                  tabIndex: isExpanded ? 0 : -1,
                })
              : child;

            return (
              <div
                key={index}
                aria-hidden={!isExpanded}
                className="pp-icon-button absolute left-0 top-0 will-change-transform"
                role="none"
                style={{
                  transform: `translateY(${isExpanded ? (index + 1) * 3.35 : 0}rem)`,
                  opacity: isExpanded ? 1 : 0,
                  pointerEvents: isExpanded ? "auto" : "none",
                  zIndex: 40 - index,
                  transition: `transform ${
                    isExpanded ? "300ms" : "300ms"
                  } cubic-bezier(0.4, 0, 0.2, 1),
                            opacity ${isExpanded ? "300ms" : "350ms"}`,
                  backfaceVisibility: "hidden",
                  perspective: 1000,
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                {menuChild}
              </div>
            );
          })}
        </div>
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
export function LanguageMenuItem({ tabIndex }) {
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

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  const currentLang = i18n.language?.slice(0, 2).toUpperCase() || "DE";

  return (
    <div className="flex h-full w-full items-center justify-center">
      {/* Globe trigger */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-full w-full items-center justify-center rounded-[0.9rem] text-[#f8e7b7] transition-colors hover:text-white"
        title={`Language: ${currentLang}`}
        aria-label={`Language: ${currentLang}`}
        aria-haspopup="true"
        aria-expanded={open}
        tabIndex={tabIndex}
        type="button"
      >
        <Globe aria-hidden="true" className="w-5 h-5" />
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
            className="overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[#fff9ea] text-[var(--text)] shadow-[var(--shadow-pixel)] min-w-[72px]"
            role="menu"
          >
            {["de", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleChange(lang)}
                aria-label={`Switch language to ${lang.toUpperCase()}`}
                className={`block w-full px-4 py-2.5 text-sm font-bold transition-colors
                  ${
                    i18n.language?.startsWith(lang)
                      ? "bg-[var(--green)] text-[#fff7e6]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--green-dark)]"
                  }`}
                role="menuitem"
                type="button"
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
