// "use client"
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
        <div
          className="relative w-10 h-10 bg-slate-100 dark:bg-slate-800 cursor-pointer rounded-full group will-change-transform z-50 flex items-center justify-center"
          onClick={handleToggle}
        >
          {childrenArray[0]}
        </div>

        {childrenArray.slice(1).map((child, index) => (
          <div
            key={index}
            className="absolute top-0 left-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 will-change-transform flex items-center justify-center"
            style={{
              transform: `translateY(${isExpanded ? (index + 1) * 32 : 0}px)`,
              opacity: isExpanded ? 1 : 0,
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
