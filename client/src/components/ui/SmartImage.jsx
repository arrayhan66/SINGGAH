import { useEffect, useState } from "react";
import { imageUrl, FALLBACK_IMAGE } from "../../utils/imageUrl";

function isCached(url) {
  if (typeof globalThis.Image === "undefined" || !url) return false;
  const probe = new Image();
  probe.src = url;
  return probe.complete && probe.naturalWidth > 0;
}

function SmartImage({
  src,
  alt = "",
  className = "",
  eager = false,
  fallback = true,
  opacity,
  onLoad,
  onError,
  style,
  ...rest
}) {
  const initialSrc = imageUrl(src);
  const [ready, setReady] = useState(() => isCached(initialSrc));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(isCached(initialSrc));
    setFailed(false);
  }, [initialSrc]);

  const finalSrc = fallback && failed ? FALLBACK_IMAGE : initialSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onLoad={(e) => {
        setReady(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        if (fallback && e.currentTarget.src !== FALLBACK_IMAGE) {
          setFailed(true);
        } else {
          setReady(true);
        }
        onError?.(e);
      }}
      style={{
        ...(opacity !== undefined ? { "--smart-img-opacity": opacity } : {}),
        ...style,
      }}
      className={`${className} smart-img ${ready ? "smart-img-ready" : "smart-img-shimmer"}`}
      {...rest}
    />
  );
}

export default SmartImage;