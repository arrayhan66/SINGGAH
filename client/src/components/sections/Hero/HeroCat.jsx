const CAT_CSS = `
.hero-cat{position:absolute;left:36%;bottom:100%;width:clamp(96px,28%,150px);transform:translateY(18%);z-index:50;pointer-events:none;filter:drop-shadow(0 6px 8px rgba(0,0,0,.22))}
.hero-cat svg{display:block;width:100%;height:auto;overflow:visible}
.hero-cat .cat-tail{transform-box:fill-box;transform-origin:100% 0%;animation:cat-tail 3.4s ease-in-out infinite}
.hero-cat .cat-body{transform-box:fill-box;transform-origin:50% 100%;animation:cat-breathe 3.6s ease-in-out infinite}
.hero-cat .cat-head{animation:cat-bob 3.6s ease-in-out infinite}
.hero-cat .cat-eyes{transform-box:fill-box;transform-origin:50% 50%;animation:cat-blink 5.5s infinite}
.hero-cat .cat-ear-r{transform-box:fill-box;transform-origin:50% 100%;animation:cat-ear 7s infinite}
@keyframes cat-tail{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-9deg)}}
@keyframes cat-breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.035)}}
@keyframes cat-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-.8px)}}
@keyframes cat-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes cat-ear{0%,88%,100%{transform:rotate(0)}91%{transform:rotate(-14deg)}94%{transform:rotate(4deg)}97%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){.hero-cat *{animation:none!important}}
`;

function HeroCat() {
  return (
    <div className="hero-cat" aria-hidden="true">
      <style>{CAT_CSS}</style>
      <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="76" cy="86" rx="60" ry="3.5" fill="rgba(0,0,0,0.25)" />
        <path className="cat-tail" d="M30 72 C 14 68, 4 76, 8 90 C 10 97, 17 98, 19 93" fill="none" stroke="#E8912D" strokeWidth="9" strokeLinecap="round" />
        <g className="cat-body">
          <path d="M22 82 C 20 58, 44 44, 78 44 C 108 44, 128 58, 130 82 Z" fill="#F4A340" />
          <path d="M42 52 C 45 58, 45 63, 42 68 M58 47 C 61 54, 61 60, 58 66 M74 45 C 77 52, 77 58, 74 64" stroke="#D9802A" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
        <g className="cat-head">
          <path d="M96 52 L98 30 L112 42 Z" fill="#F7B05A" stroke="#F7B05A" strokeWidth="2" strokeLinejoin="round" />
          <path d="M100 47 L100.5 36 L108 42 Z" fill="#F4A6A6" />
          <g className="cat-ear-r">
            <path d="M136 52 L134 30 L120 42 Z" fill="#F7B05A" stroke="#F7B05A" strokeWidth="2" strokeLinejoin="round" />
            <path d="M132 47 L131.5 36 L124 42 Z" fill="#F4A6A6" />
          </g>
          <ellipse cx="116" cy="60" rx="23" ry="19" fill="#F7B05A" />
          <path d="M116 42 L116 48 M110 43 L111 48 M122 43 L121 48" stroke="#D9802A" strokeWidth="2" strokeLinecap="round" />
          <g className="cat-eyes">
            <ellipse cx="107" cy="58" rx="4.4" ry="4.8" fill="#A3E635" />
            <ellipse cx="125" cy="58" rx="4.4" ry="4.8" fill="#A3E635" />
            <ellipse cx="107" cy="58" rx="1.4" ry="3.8" fill="#1b1b1b" />
            <ellipse cx="125" cy="58" rx="1.4" ry="3.8" fill="#1b1b1b" />
            <circle cx="108.4" cy="56.4" r="1" fill="#fff" />
            <circle cx="126.4" cy="56.4" r="1" fill="#fff" />
            <path d="M102 58.2 Q107 52.2 112 58.2 Z" fill="#F7B05A" />
            <path d="M120 58.2 Q125 52.2 130 58.2 Z" fill="#F7B05A" />
          </g>
          <path d="M113.5 64 L118.5 64 L116 67 Z" fill="#E87A8A" />
          <path d="M116 67 L116 69 M116 69 C 113 72.5, 110 70.5, 110 69 M116 69 C 119 72.5, 122 70.5, 122 69" stroke="#8a4b1f" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M104 65 L88 62 M104 68 L88 70 M128 65 L144 62 M128 68 L144 70" stroke="#7a4a1e" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
        </g>
        <ellipse cx="103" cy="84" rx="8" ry="6.5" fill="#F7B05A" />
        <ellipse cx="129" cy="84" rx="8" ry="6.5" fill="#F7B05A" />
        <path d="M101 86 L101 90 M105 86 L105 90 M127 86 L127 90 M131 86 L131 90" stroke="#D9802A" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default HeroCat;
