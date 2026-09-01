import { useState } from "react"

function getInitials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function UserAvatar({
  name,
  avatar,
  className = "",
  imgClass = "object-cover",
  imgSizeClass = "h-10 w-10",
  fallbackClass = "bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white",
  fallbackSizeClass = "h-10 w-10",
  textClass = "text-xs",
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = avatar && !imgFailed

  return (
    <div className={`${className} flex shrink-0 items-center justify-center`}>
      {showImg ? (
        <img
          src={avatar}
          alt={name}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className={`${imgSizeClass} rounded-full ${imgClass}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full ${fallbackSizeClass} ${fallbackClass} ${textClass}`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}

export default UserAvatar
