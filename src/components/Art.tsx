import type { ArtId } from "@/lib/data";

// Illustrated placeholder artwork (replace with real product photos later).
export function Art({ id, className = "" }: { id: ArtId; className?: string }) {
  const common = { className: `h-full w-full ${className}`, preserveAspectRatio: "xMidYMid slice", viewBox: "0 0 300 400" };
  switch (id) {
    case "dusk":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="dk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c2350" />
              <stop offset=".55" stopColor="#c8615a" />
              <stop offset="1" stopColor="#f1b27a" />
            </linearGradient>
          </defs>
          <rect width="300" height="400" fill="url(#dk)" />
          <circle cx="150" cy="250" r="55" fill="#ffd6a0" opacity=".9" />
          <path d="M0 300 Q75 260 150 290 T300 280 V400 H0Z" fill="#3b2433" />
          <path d="M0 340 Q100 310 200 335 T300 330 V400 H0Z" fill="#20141d" />
        </svg>
      );
    case "coast":
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#bfe0e6" />
          <rect y="0" width="300" height="200" fill="#e9f3f0" />
          <circle cx="220" cy="90" r="30" fill="#ffe7b8" />
          <path d="M0 200 Q150 185 300 200 V260 H0Z" fill="#5fa3b0" />
          <path d="M0 250 Q150 230 300 250 V400 H0Z" fill="#2f7a8c" />
          <path d="M0 330 Q120 300 300 340 V400 H0Z" fill="#efe0c2" />
        </svg>
      );
    case "bloom":
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#f4e4dc" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx="150" cy="170" rx="28" ry="70" fill="#e39a8c" opacity=".75" transform={`rotate(${i * 30} 150 200)`} />
          ))}
          <circle cx="150" cy="200" r="22" fill="#c86f4f" />
          <path d="M150 230 C145 300 160 340 150 400" stroke="#6f7d63" strokeWidth="6" fill="none" />
        </svg>
      );
    case "hills":
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#f2e6d0" />
          <circle cx="90" cy="120" r="40" fill="#e9a35b" />
          <path d="M0 260 Q80 170 160 240 T300 210 V400 H0Z" fill="#9aa883" />
          <path d="M0 310 Q100 240 200 300 T300 290 V400 H0Z" fill="#6f7d63" />
          <path d="M0 360 Q150 320 300 360 V400 H0Z" fill="#45503d" />
        </svg>
      );
    case "temple":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="tp" cx=".5" cy=".4" r=".7">
              <stop offset="0" stopColor="#ffe3a3" />
              <stop offset="1" stopColor="#b8541f" />
            </radialGradient>
          </defs>
          <rect width="300" height="400" fill="url(#tp)" />
          <circle cx="150" cy="170" r="70" fill="none" stroke="#fff3cf" strokeWidth="3" opacity=".8" />
          <circle cx="150" cy="170" r="95" fill="none" stroke="#fff3cf" strokeWidth="1.5" opacity=".5" />
          <path d="M120 300 Q150 230 180 300Z" fill="#7a2e12" />
          <ellipse cx="150" cy="305" rx="45" ry="10" fill="#7a2e12" />
          <path d="M150 225 Q160 250 150 262 Q140 250 150 225Z" fill="#fff3cf" />
        </svg>
      );
    case "petal":
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#f6dcd6" />
          <path d="M150 300 C70 240 60 160 110 140 C135 130 150 150 150 170 C150 150 165 130 190 140 C240 160 230 240 150 300Z" fill="#c7584f" />
          {[...Array(14)].map((_, i) => (
            <circle key={i} cx={(i * 53) % 300} cy={(i * 97) % 400} r={3 + (i % 3)} fill="#fff" opacity=".6" />
          ))}
        </svg>
      );
    case "noir":
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#d9d6d1" />
          <rect x="20" y="150" width="50" height="250" fill="#3a3734" />
          <rect x="80" y="90" width="60" height="310" fill="#1f1d1b" />
          <rect x="150" y="190" width="45" height="210" fill="#4a4743" />
          <rect x="205" y="120" width="70" height="280" fill="#2b2927" />
          <circle cx="230" cy="70" r="22" fill="#f4f1ec" />
        </svg>
      );
    case "meadow":
    default:
      return (
        <svg {...common}>
          <rect width="300" height="400" fill="#f7ecd2" />
          <circle cx="210" cy="110" r="45" fill="#f0c15a" />
          <path d="M0 280 Q150 230 300 280 V400 H0Z" fill="#c9b36b" />
          {[...Array(22)].map((_, i) => (
            <path key={i} d={`M${10 + i * 13} 400 Q${14 + i * 13} ${330 - (i % 5) * 12} ${20 + i * 13} ${300 - (i % 4) * 15}`} stroke="#8a7a3a" strokeWidth="2" fill="none" />
          ))}
        </svg>
      );
  }
}
