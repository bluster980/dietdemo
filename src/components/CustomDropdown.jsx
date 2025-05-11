import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ options, selected, onSelect, placeholder = 'Select' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-[360px] mt-1">
      <div
        className="border-2 border-gray-300 px-4 h-[50px] flex items-center justify-between text-[21px] rounded-xl cursor-pointer bg-white"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selected ? 'text-black' : 'text-gray-400'}>
          {selected ? options.find(o => o.value === selected)?.label : placeholder}
        </span>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <ul className="absolute left-0 right-0 mt-[1px] z-10 bg-white border border-gray-300">
          {options.map((option, index) => {
            const isFirst = index === 0;
            const isLast = index === options.length - 1;

            return (
              <li
                key={option.value}
                className={`
                  px-4 py-3 text-[20px] cursor-pointer hover:bg-orange-100
                  border-t border-gray-200
                  ${isFirst ? 'rounded-t-[5px]' : ''}
                  ${isLast ? 'rounded-b-[5px]' : ''}
                `}
                onClick={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
