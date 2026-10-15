/**
 * Número de catálogo de uma publicação (ex.: "JQT-001"), no espírito da
 * numeração de selos como a Factory Records. É estável e não depende de slug.
 */
export class InvalidCatalogNumberError extends Error {
  constructor(value: unknown) {
    super(`Número de catálogo inválido: ${String(value)}`);
    this.name = "InvalidCatalogNumberError";
  }
}

const PREFIX = "JQT";
const PATTERN = /^JQT-(\d{3,})$/;

export class CatalogNumber {
  private constructor(readonly sequence: number) {}

  static fromSequence(sequence: number): CatalogNumber {
    if (!Number.isInteger(sequence) || sequence < 1) {
      throw new InvalidCatalogNumberError(sequence);
    }
    return new CatalogNumber(sequence);
  }

  static parse(value: string): CatalogNumber {
    const match = PATTERN.exec(value);
    if (!match) throw new InvalidCatalogNumberError(value);

    const catalogNumber = CatalogNumber.fromSequence(Number(match[1]));
    // Só aceita a forma canônica: "JQT-0010" não é um apelido de "JQT-010".
    if (catalogNumber.toString() !== value) throw new InvalidCatalogNumberError(value);
    return catalogNumber;
  }

  equals(other: CatalogNumber): boolean {
    return this.sequence === other.sequence;
  }

  toString(): string {
    return `${PREFIX}-${String(this.sequence).padStart(3, "0")}`;
  }
}
