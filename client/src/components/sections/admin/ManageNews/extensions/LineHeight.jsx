import { Extension } from "@tiptap/core"

const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          if (!lineHeight) {
            return this.options.types
              .map((type) => commands.resetAttributes(type, "lineHeight"))
              .some((response) => response)
          }
          return this.options.types
            .map((type) => commands.updateAttributes(type, { lineHeight }))
            .some((response) => response)
        },
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, "lineHeight"))
            .some((response) => response),
    }
  },
})

export default LineHeight