let listener = null

const toast = {
  show(message, type = "error") {
    listener?.({ message, type })
  },
  success(message) {
    toast.show(message, "success")
  },
  error(message) {
    toast.show(message, "error")
  },
  setListener(fn) {
    listener = fn
  },
}

export default toast
