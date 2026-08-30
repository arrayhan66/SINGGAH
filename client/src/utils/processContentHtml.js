import DOMPurify from "dompurify"

export function processContentHtml(html) {
  if (!html || typeof html !== "string") return html

  const doc = new DOMParser().parseFromString(html, "text/html")
  const imgs = doc.querySelectorAll("img[data-caption]")

  imgs.forEach((img) => {
    const caption = img.getAttribute("data-caption")
    if (!caption) return

    const figure = doc.createElement("figure")
    figure.className = "my-2 min-[350px]:my-4 sm:my-5 rounded-none overflow-hidden"

    const imgClone = img.cloneNode(true)
    imgClone.removeAttribute("data-caption")
    imgClone.removeAttribute("title")
    imgClone.removeAttribute("width")
    imgClone.removeAttribute("height")
    imgClone.removeAttribute("style")
    imgClone.removeAttribute("class")
    imgClone.className = "block h-auto w-full max-w-full"

    const figcaption = doc.createElement("figcaption")
    figcaption.className = "relative border-l-[4px] border-cyan-400 pl-4 sm:pl-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-transparent text-white text-sm sm:text-[15px] sm:text-base italic leading-relaxed rounded-r-lg figcaption-caption"
    figcaption.textContent = caption

    const wrapper = doc.createElement("div")
    wrapper.className = "w-full max-h-[500px] overflow-hidden bg-slate-100 dark:bg-slate-800"
    wrapper.appendChild(imgClone)

    figure.appendChild(wrapper)
    figure.appendChild(figcaption)

    img.parentNode.replaceChild(figure, img)
  })

  return DOMPurify.sanitize(doc.body.innerHTML, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["figure", "figcaption"],
    ADD_ATTR: ["target"],
  })
}
