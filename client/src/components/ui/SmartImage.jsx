import { useState } from "react";
import { imageUrl, FALLBACK_IMAGE } from "../../utils/imageUrl";

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
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const finalSrc = fallback && failed ? FALLBACK_IMAGE : imageUrl(src);

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