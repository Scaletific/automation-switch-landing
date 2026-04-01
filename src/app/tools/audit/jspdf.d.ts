declare module "jspdf" {
  interface jsPDFOptions {
    unit?: string;
    format?: string;
  }
  class jsPDF {
    constructor(options?: jsPDFOptions);
    setFillColor(r: number, g: number, b: number): void;
    setTextColor(r: number, g: number, b: number): void;
    setDrawColor(r: number, g: number, b: number): void;
    setFontSize(size: number): void;
    setFont(name: string, style?: string): void;
    text(text: string, x: number, y: number, options?: { maxWidth?: number }): void;
    rect(x: number, y: number, w: number, h: number, style: string): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    addPage(): void;
    getNumberOfPages(): number;
    setPage(page: number): void;
    output(type: "blob"): Blob;
  }
  export default jsPDF;
}
