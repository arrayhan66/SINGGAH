const FX_CSS = `
.hero-fx{position:absolute;inset:0;pointer-events:none}
.hero-fx .fx-beam{position:absolute;inset:-1px;border-radius:17px;padding:2px;overflow:hidden;z-index:29;background:rgba(96,165,250,.28);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;filter:drop-shadow(0 0 6px rgba(34,211,238,.55))}
.hero-fx .fx-beam-spin{position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;transform:translate(-50%,-50%) rotate(0deg);background:conic-gradient(from 0deg,transparent 0 55%,#22d3ee 78%,#60a5fa 88%,#a78bfa 94%,transparent 100%);animation:fx-spin 5s linear infinite}
@keyframes fx-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
@media (max-width:768px){.hero-fx .fx-beam{display:none}}
@media (prefers-reduced-motion:reduce){.hero-fx *{animation:none!important}}
`;

function HeroFX() {
  return (
    <div className="hero-fx" aria-hidden="true">
      <style>{FX_CSS}</style>
      <div className="fx-beam">
        <span className="fx-beam-spin" />
      </div>
    </div>
  );
}

export default HeroFX;
