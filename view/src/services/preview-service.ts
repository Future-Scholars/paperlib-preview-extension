import { PLAPI, PLMainAPI, PaperEntity } from "paperlib-api";
import * as pdfjs from "pdfjs-dist";

export class PreviewService {
  private _renderingPDF?: pdfjs.PDFDocumentProxy;
  private _renderingPage?: pdfjs.PDFPageProxy;

  constructor() {
    pdfjs.GlobalWorkerOptions.workerSrc = "../pdf.worker.min.mjs";
  }

  async preview() {
    const selectedPaperEntities = (await PLAPI.uiStateService.getState(
      "selectedPaperEntities"
    )) as PaperEntity[];
    console.log("Preview")

    if (selectedPaperEntities.length === 0) {
      console.log("No paper selected")
      return;
    }

    const fileURL = await PLAPI.fileService.access(
      selectedPaperEntities[0].mainURL,
      true
    );

    console.log("Preview", fileURL)

    if (this._renderingPage) {
      this._renderingPage.cleanup();
    }
    if (this._renderingPDF) {
      this._renderingPDF.destroy();
    }
    this._renderingPDF = await pdfjs.getDocument(fileURL).promise;
    this._renderingPage = await this._renderingPDF.getPage(1);
    const viewport = this._renderingPage.getViewport({ scale: 1.5 });
    const outputScale = window.devicePixelRatio || 1;
    const canvas = document.getElementById(
      "preview-canvas"
    ) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
    const renderContext = {
      canvasContext: context,
      transform: transform,
      viewport: viewport,
    };
    await this._renderingPage.render(renderContext).promise;
    this._renderingPDF.destroy();
  }

  async close() {
    this._renderingPage?.cleanup();

    const canvas = document.getElementById(
      "preview-canvas"
    ) as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);

    await PLMainAPI.windowProcessManagementService.hide(
      "paperlib-preview-extension-window"
    );
  }
}
