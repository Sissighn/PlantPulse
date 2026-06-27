import { describe, expect, it, vi } from "vitest";

const {
  chatImageFileFilter,
  detectImageMimeType,
} = require("./uploadValidation");

describe("uploadValidation", () => {
  it("detects supported image signatures", () => {
    expect(detectImageMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg"
    );
    expect(
      detectImageMimeType(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    ).toBe("image/png");
    expect(
      detectImageMimeType(Buffer.from("RIFFxxxxWEBP", "ascii"))
    ).toBe("image/webp");
  });

  it("rejects unknown file signatures", () => {
    expect(detectImageMimeType(Buffer.from("not an image"))).toBeNull();
  });

  it("allows only expected chat image MIME types", () => {
    const callback = vi.fn();

    chatImageFileFilter(null, { mimetype: "image/png" }, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("rejects unsupported chat upload MIME types", () => {
    const callback = vi.fn();

    chatImageFileFilter(null, { mimetype: "image/svg+xml" }, callback);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Only JPEG, PNG, or WebP images can be uploaded.",
        status: 400,
      })
    );
  });
});
