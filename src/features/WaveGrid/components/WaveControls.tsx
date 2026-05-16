type WaveParam = "amplitude" | "frequency" | "speed";

interface WaveControlsProps {
  amplitude: number;
  frequency: number;
  speed: number;
  onChange: (key: WaveParam, value: number) => void;
}

const SLIDERS: {
  label: string;
  key: WaveParam;
  min: number;
  max: number;
  step: number;
}[] = [
  { label: "Amplitude", key: "amplitude", min: 0.1, max: 3, step: 0.05 },
  { label: "Frequency", key: "frequency", min: 0.1, max: 4, step: 0.05 },
  { label: "Speed", key: "speed", min: 0.1, max: 4, step: 0.05 },
];

export default function WaveControls({
  amplitude,
  frequency,
  speed,
  onChange,
}: WaveControlsProps) {
  const values = { amplitude, frequency, speed };

  return (
    <div className="absolute top-4 right-4 z-50 bg-blue-950 border border-blue-400/80 text-white p-4 rounded-lg flex flex-col gap-3 min-w-60">
      <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Wave Controls
      </p>
      {SLIDERS.map(({ label, key, min, max, step }) => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-white/80">{label}</span>
            <span className="text-white/50">{values[key].toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={values[key]}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            className="w-full accent-blue-400"
          />
        </div>
      ))}
    </div>
  );
}
