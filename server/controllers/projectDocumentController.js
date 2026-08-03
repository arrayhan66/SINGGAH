const asyncHandler = require("../utils/asyncHandler")
const projectDocumentService = require("../services/projectDocumentService")
const { success } = require("../utils/response")

exports.getDocuments = asyncHandler(async (req, res) => {
  const docs = await projectDocumentService.getDocuments(req.params.id)
  success(res, docs)
})

exports.addDocument = asyncHandler(async (req, res) => {
  const doc = await projectDocumentService.addDocument(
    req.params.id,
    req.body,
    req.user,
  )
  success(res, doc, "Dokumen ditambahkan", 201)
})

exports.removeDocument = asyncHandler(async (req, res) => {
  await projectDocumentService.removeDocument(
    req.params.id,
    req.params.docId,
    req.user,
  )
  success(res, null, "Dokumen dihapus")
})
