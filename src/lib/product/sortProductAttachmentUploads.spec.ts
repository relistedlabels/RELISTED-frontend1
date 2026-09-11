import { sortProductAttachmentUploads } from "./sortProductAttachmentUploads";

describe("sortProductAttachmentUploads", () => {
  it("preserves API order when displayOrder is omitted", () => {
    const uploads = [
      { id: "zzz-hero", url: "https://cdn/a.jpg" },
      { id: "aaa-second", url: "https://cdn/b.jpg" },
    ];
    expect(sortProductAttachmentUploads(uploads).map((u) => u.id)).toEqual([
      "zzz-hero",
      "aaa-second",
    ]);
  });

  it("sorts by displayOrder when present", () => {
    const uploads = [
      { id: "b", url: "https://cdn/b.jpg", displayOrder: 1 },
      { id: "a", url: "https://cdn/a.jpg", displayOrder: 0 },
    ];
    expect(sortProductAttachmentUploads(uploads).map((u) => u.id)).toEqual([
      "a",
      "b",
    ]);
  });
});
