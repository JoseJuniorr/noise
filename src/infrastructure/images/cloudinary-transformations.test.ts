import { describe, expect, it } from "vitest";
import { parseImageTreatment } from "@/core/domain/image-treatment";
import { cloudinaryArtImage, cloudinarySrc } from "./cloudinary-transformations";

describe("cloudinarySrc", () => {
  it("sem tratamento, entrega só o id", () => {
    expect(cloudinarySrc({ publicId: "noise/ensaio", alt: "" })).toBe("noise/ensaio");
  });

  it("corta na proporção com o foco pedido e aplica o filtro", () => {
    const treatment = parseImageTreatment({ filter: "sepia", ratio: "quadrado", focus: "rosto" });
    expect(cloudinarySrc({ publicId: "noise/ensaio", alt: "", treatment })).toBe(
      "ar_1:1,c_fill,g_face/e_sepia:60/noise/ensaio",
    );
  });

  it("não manda o tratamento da casa para o Cloudinary", () => {
    const treatment = parseImageTreatment({ filter: "submersa", ratio: "panoramico" });
    expect(cloudinarySrc({ publicId: "noise/x", alt: "", treatment })).toBe("ar_21:9,c_fill,g_auto/noise/x");
  });

  it("deixa caminhos locais intactos", () => {
    const treatment = parseImageTreatment({ filter: "vinheta", ratio: "retrato" });
    expect(cloudinarySrc({ publicId: "/imagens/submersa.jpg", alt: "", treatment })).toBe("/imagens/submersa.jpg");
  });
});

describe("cloudinaryArtImage", () => {
  const base = { cloudName: "noise", siteUrl: "https://noise.discory.com.br", width: 1080, height: 1100 };

  it("corta no tamanho da arte e imita a foto submersa com efeitos do Cloudinary", () => {
    expect(cloudinaryArtImage({ publicId: "noise/ensaio", alt: "" }, base)).toBe(
      "https://res.cloudinary.com/noise/image/upload/c_fill,w_1080,h_1100,g_auto/e_grayscale/e_contrast:30/e_brightness:-15/f_jpg,q_auto/noise/ensaio",
    );
  });

  it("respeita o filtro escolhido e o foco do corte", () => {
    const treatment = parseImageTreatment({ filter: "sepia", focus: "rosto" });
    expect(cloudinaryArtImage({ publicId: "noise/x", alt: "", treatment }, base)).toBe(
      "https://res.cloudinary.com/noise/image/upload/c_fill,w_1080,h_1100,g_face/e_sepia:60/f_jpg,q_auto/noise/x",
    );
  });

  it("serve imagens locais pelo próprio site", () => {
    expect(cloudinaryArtImage({ publicId: "/imagens/submersa.jpg", alt: "" }, base)).toBe(
      "https://noise.discory.com.br/imagens/submersa.jpg",
    );
  });
});

describe("parseImageTreatment", () => {
  it("troca valores desconhecidos pelo padrão em vez de falhar", () => {
    expect(parseImageTreatment({ filter: "neon", ratio: 3, focus: undefined })).toEqual({
      filter: "submersa",
      ratio: "original",
      focus: "automatico",
    });
  });
});
