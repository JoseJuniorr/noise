import { describe, expect, it } from "vitest";
import { cloudinaryUrl } from "./cloudinary-loader";

describe("cloudinaryUrl", () => {
  it("monta a URL com formato automático e a largura pedida pelo next/image", () => {
    expect(cloudinaryUrl("noise", { src: "noise/submersa", width: 1080 })).toBe(
      "https://res.cloudinary.com/noise/image/upload/f_auto,c_limit,w_1080,q_auto/noise/submersa",
    );
  });

  it("respeita a qualidade explícita", () => {
    expect(cloudinaryUrl("noise", { src: "noise/ensaio", width: 640, quality: 60 })).toBe(
      "https://res.cloudinary.com/noise/image/upload/f_auto,c_limit,w_640,q_60/noise/ensaio",
    );
  });

  it("serve imagens locais de public/ como estão, mesmo sem Cloudinary", () => {
    expect(cloudinaryUrl(undefined, { src: "/imagens/submersa.jpg", width: 1080 })).toBe(
      "/imagens/submersa.jpg?w=1080",
    );
  });

  it("falha com uma mensagem clara quando o Cloudinary não está configurado", () => {
    expect(() => cloudinaryUrl(undefined, { src: "noise/x", width: 100 })).toThrow(
      /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/,
    );
  });
});
