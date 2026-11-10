import useIsDesktop from "../../../hooks/useIsDesktop";

// Sudut tiap garis diukur dari garis horizontal. Dipakai simetris kiri/kanan
// lewat 180 - a, ditambah satu garis tegak lurus (90) di tengah.
const ANGLES = [5, 16, 22, 29, 37, 46, 57, 70];
const MOBILE_ANGLES = ANGLES.slice(0, 4);

// Titik temu sengaja di bawah tepi bawah area hero agar pangkalnya tidak terlihat.
const ORIGIN = { x: 800, y: 780 };
const LEN = 1800;
const rad = (d) => (d * Math.PI) / 180;

const buildLines = (angles) => [90, ...angles.flatMap((a) => [a, 180 - a])];

// Aksen mengikuti tombol "Mulai Eksplorasi": cyan di dark, biru di light.
const ACCENT_SOFT = "color-mix(in srgb, var(--hero-accent) 28%, transparent)";

export default function HeroRays() {
  const isDesktop = useIsDesktop(640);
  const lines = buildLines(isDesktop ? ANGLES : MOBILE_ANGLES);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Sorot kipas: lebar di atas, mengecil ke bawah, tepi dilembutkan blur */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] blur-2xl">
        <div
          className="h-full w-full"
          style={{
            clipPath: "polygon(48% 100%, 52% 100%, 66% 0, 34% 0)",
            background: `linear-gradient(to top, ${ACCENT_SOFT} 0%, transparent 85%)`,
          }}
        />
      </div>

      <svg
        className="absolute inset-0 h-full w-full text-slate-600/60 light:text-slate-300/70"
        viewBox="0 0 1600 700"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <radialGradient
            id="hero-rays-fade"
            gradientUnits="userSpaceOnUse"
            cx="800"
            cy="780"
            r="1000"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask
            id="hero-rays-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1600"
            height="700"
          >
            <rect width="1600" height="700" fill="url(#hero-rays-fade)" />
          </mask>
        </defs>
        <g
          mask="url(#hero-rays-mask)"
          stroke="currentColor"
          strokeWidth="0.75"
          fill="none"
        >
          {lines.map((a) => (
            <line
              key={a}
              x1={ORIGIN.x}
              y1={ORIGIN.y}
              x2={ORIGIN.x + LEN * Math.cos(rad(a))}
              y2={ORIGIN.y - LEN * Math.sin(rad(a))}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
