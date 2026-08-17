import { Mark, mergeAttributes } from "@tiptap/core"

const FontSize = Mark.create({
  name: "fontSize",

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: "span",
        getAttrs: (element) => {
          const fontSize = element.style?.fontSize
          if (!fontSize) return false
          return { fontSize }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, {
        style: `font-size: ${HTMLAttributes.fontSize}`,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ commands }) => {
          return commands.setMark(this.name, { fontSize })
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-.": () => this.editor.commands.unsetFontSize(),
    }
  },
})

export default FontSize
