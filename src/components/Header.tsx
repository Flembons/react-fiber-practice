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
    <header
      style={{
        height: 52,
        background: "#0f0f1a",
        borderBottom: "1px solid #ffffff18",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {scenes.map((scene) => {
        const isActive = scene.id === active;
        return (
          <button
            key={scene.id}
            onClick={() => onSelect(scene.id)}
            style={{
              background: isActive ? "#ffffff18" : "transparent",
              color: isActive ? "#ffffff" : "#ffffff66",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {scene.label}
          </button>
        );
      })}
    </header>
  );
}
