jest.mock("../utils/uploadToCloudinary", () => ({
  listCloudinaryMedia: jest.fn(),
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
}))

const mediaService = require("../services/mediaService")
const uploadUtils = require("../utils/uploadToCloudinary")

describe("MediaService.deleteMedia", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should throw 400 when public_id is empty", async () => {
    await expect(mediaService.deleteMedia()).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(uploadUtils.deleteImage).not.toHaveBeenCalled()
  })

  it("should delete an image resource on the first attempt", async () => {
    uploadUtils.deleteImage.mockResolvedValueOnce({ result: "ok" })

    await expect(
      mediaService.deleteMedia("singgah/media/banner"),
    ).resolves.toBe(true)

    expect(uploadUtils.deleteImage).toHaveBeenCalledTimes(1)
    expect(uploadUtils.deleteImage).toHaveBeenCalledWith("singgah/media/banner")
  })

  it("should retry with resource_type raw when image destroy is not found", async () => {
    uploadUtils.deleteImage
      .mockResolvedValueOnce({ result: "not found" })
      .mockResolvedValueOnce({ result: "ok" })

    await expect(
      mediaService.deleteMedia("singgah/media/C030322048_Tugas_1_K3danKetenagakerjaan_mtxevq.pdf"),
    ).resolves.toBe(true)

    expect(uploadUtils.deleteImage).toHaveBeenCalledTimes(2)
    expect(uploadUtils.deleteImage).toHaveBeenLastCalledWith(
      "singgah/media/C030322048_Tugas_1_K3danKetenagakerjaan_mtxevq.pdf",
      { resource_type: "raw" },
    )
  })

  it("should throw 404 when the resource is not found in either attempt", async () => {
    uploadUtils.deleteImage.mockResolvedValue({ result: "not found" })

    await expect(
      mediaService.deleteMedia("singgah/media/does-not-exist"),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(uploadUtils.deleteImage).toHaveBeenCalledTimes(2)
  })
})