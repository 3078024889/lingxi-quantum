declare module "pdf-parse" {
  export interface PDFInfo {
    [key: string]: unknown;
  }

  export interface PDFMetadata {
    [key: string]: unknown;
  }

  export interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata | null;
    text: string;
    version: string;
  }

  export interface PDFParseOptions {
    pagerender?: (pageData: unknown) => Promise<string> | string;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export = pdfParse;
}