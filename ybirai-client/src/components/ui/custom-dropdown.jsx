import React, { useState, useRef, useEffect } from 'react';
import { cn } from "../../lib/utils";

const CustomDropdown = ({ 
  trigger, 
  items,
  align = 'end',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block">
      <div 
        ref={triggerRef}
        onClick={toggleDropdown}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
            align === 'end' ? 'right-0' : 'left-0',
            className
          )}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.className
                )}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
              >
                {item.icon && (
                  <span className="mr-2 h-4 w-4">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
