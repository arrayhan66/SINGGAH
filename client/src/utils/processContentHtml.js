export function processContentHtml(html) {
  if (!html || typeof html !== "string") return html

  const doc = new DOMParser().parseFromString(html, "text/html")
  const imgs = doc.querySelectorAll("img[data-caption]")

  imgs.forEach((img) => {
    const caption = img.getAttribute("data-caption")
    if (!caption) return

    const figure = doc.createElement("figure")
    figure.className = "my-4 sm:my-5 rounded-xl overflow-hidden"

    const imgClone = img.cloneNode(true)
    imgClone.removeAttribute("data-caption")
    imgClone.removeAttribute("title")
    imgClone.className = "w-full h-auto object-cover block"

    const figcaption = doc.createElement("figcaption")
    figcaption.className = "text-center text-[11px] sm:text-xs text-slate-500 italic pt-2"
    figcaption.textContent = caption

    const wrapper = doc.createElement("div")
    wrapper.className = "w-full max-h-[500px] overflow-hidden bg-slate-100"
    wrapper.appendChild(imgClone)

    figure.appendChild(wrapper)
    figure.appendChild(figcaption)

    img.parentNode.replaceChild(figure, img)
  })

  return doc.body.innerHTML
}
