/** "1 passou por aqui", "37 passaram por aqui". */
export function passageLabel(count: number): string {
  return `${count} ${count === 1 ? "passou" : "passaram"} por aqui`;
}
