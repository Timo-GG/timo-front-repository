import { useState } from 'react';

interface DropdownMenuProps {
  navItems: string[];
}
export default function DropdownMenu({ navItems }: DropdownMenuProps) {
  let [isOpen, setIsOpen] = useState(false);
  let [activeMenu, setActiveMenu] = useState(navItems[0]);
  return (
    <div>
      <button
        className="h-32 py-10 px-20 bg-primary-gray flex justify-between items-center gap-10 rounded-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-primary-lightgray text-body3-13-regular whitespace-nowrap">
          {activeMenu}
        </div>
        <div className="text-body3-13-regular">{isOpen ? '▲' : '▼'}</div>
      </button>

      <div className="relative">
        {isOpen && (
          <ul className="w-full flex flex-col items-center justify-center gap-6 absolute right-0 bg-gray-800">
            {navItems.map(item => (
              <li key={item}>
                <button
                  className={`px-4 py-2 text-body3-13-regular rounded ${
                    activeMenu === item ? 'bg-blue-500' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setActiveMenu(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
