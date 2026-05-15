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
  return (
    <header className="flex items-center px-4 py-3 gap-4 bg-[#0f0f1a] border-b border-[#ffffff18]">
      {scenes.map((scene) => {
        const isActive = scene.id === active;
        return (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors duration-250 ${
              isActive
                ? "bg-[#ffffff18] text-white"
                : "bg-none hover:bg-gray-800 hover:text-gray-400 text-gray-500"
            }`}
          >
            {scene.label}
          </button>
        );
      })}
    </header>
  );
}
