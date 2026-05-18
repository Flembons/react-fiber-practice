import { useState } from "react";

interface Scene {
  id: string;
  label: string;
}

interface HeaderProps {
  scenes: Scene[];
  active: string;
  onSelect: (id: string) => void;
}

export default function Header({ scenes, active, onSelect }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const btnClass = (isActive: boolean, fullWidth = false) =>
    `${fullWidth ? "w-full text-center" : "w-fit text-left"} px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-300 ease-out ${
      isActive
        ? "bg-[#ffffff18] text-white"
        : "bg-none hover:bg-gray-800 hover:text-gray-400 text-gray-500"
    }`;

  return (
    <>
      <header className="flex items-center px-4 py-3 gap-4 bg-[#0f0f1a] border-b border-[#ffffff18]">
        {/* Mobile hamburger */}
        <button
          className="sm:hidden cursor-pointer text-gray-400 hover:text-white p-1"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1" />
            <rect y="9" width="20" height="2" rx="1" />
            <rect y="15" width="20" height="2" rx="1" />
          </svg>
        </button>

        {/* Desktop nav */}
        <nav className="hidden sm:flex justify-start items-center gap-4">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSelect(scene.id)}
              className={btnClass(scene.id === active)}
            >
              {scene.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 z-60 sm:hidden transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 w-56 bg-[#0f0f1a] border-r border-[#ffffff18] z-70 sm:hidden flex flex-col p-3 gap-1 transition-[margin-left] duration-300 ease-out ${open ? "ml-0" : "-ml-56"}`}
      >
        <button
          className="cursor-pointer self-end text-gray-500 hover:text-white p-1 mb-2"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => handleSelect(scene.id)}
            className={btnClass(scene.id === active, true)}
          >
            {scene.label}
          </button>
        ))}
      </div>
    </>
  );
}
