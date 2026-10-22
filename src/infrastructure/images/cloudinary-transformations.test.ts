import { describe, expect, it } from "vitest";
import { parseImageTreatment } from "@/core/domain/image-treatment";
import { cloudinarySrc } from "./cloudinary-transformations";

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

describe("parseImageTreatment", () => {
  it("troca valores desconhecidos pelo padrão em vez de falhar", () => {
    expect(parseImageTreatment({ filter: "neon", ratio: 3, focus: undefined })).toEqual({
      filter: "submersa",
      ratio: "original",
      focus: "automatico",
    });
  });
});
