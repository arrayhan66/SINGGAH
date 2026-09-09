import { Extension } from "@tiptap/core"

const ParagraphSpacing = Extension.create({
  name: "paragraphSpacing",

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
          marginBottom: {
            default: null,
            parseHTML: (element) => element.style.marginBottom || null,
            renderHTML: (attributes) => {
              if (!attributes.marginBottom) return {}
              return { style: `margin-bottom: ${attributes.marginBottom}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setParagraphSpacing:
        (marginBottom) =>
        ({ commands }) => {
          if (!marginBottom) {
            return this.options.types
              .map((type) => commands.resetAttributes(type, "marginBottom"))
              .some((response) => response)
          }
          return this.options.types
            .map((type) => commands.updateAttributes(type, { marginBottom }))
            .some((response) => response)
        },
      unsetParagraphSpacing:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, "marginBottom"))
            .some((response) => response),
    }
  },
})

export default ParagraphSpacing