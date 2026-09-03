exports.success = (res, data = null, message = "Berhasil", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  })
}

exports.fail = (res, message = "Terjadi kesalahan", status = 500, data = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(data ? { data } : {}),
  })
}
