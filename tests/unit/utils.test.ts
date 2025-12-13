import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500"); // tailwind merge
  });
});