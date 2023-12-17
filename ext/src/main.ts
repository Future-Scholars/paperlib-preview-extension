import { PLExtension } from "@/models/extension";
import { PLAPI, PLExtAPI, PLMainAPI } from "paperlib";
import path from "path";

class PaperlibPreviewExtension extends PLExtension {
  disposeCallbacks: (() => void)[];

  constructor() {
    super({
      id: "paperlib-preview-extension",
      name: "Paper Preview",
      description:
        "This extension is for Windows and Linux users to preview a paper in Paperlib",
      author: "Paperlib",
      defaultPreference: {},
    });

    this.disposeCallbacks = [];
  }

  private async _createPreviewWindow() {
    const screenSize =
      await PLMainAPI.windowProcessManagementService.getScreenSize();
    await PLMainAPI.windowProcessManagementService.create(
      "paperlib-preview-extension-window",
      {
        entry: path.resolve(__dirname, "./view/index.html"),
        title: "Paper Preview",
        width: Math.floor(screenSize.height * 0.8 * 0.75),
        height: Math.floor(screenSize.height * 0.8),
        minWidth: Math.floor(screenSize.height * 0.8 * 0.75),
        minHeight: Math.floor(screenSize.height * 0.8),
        useContentSize: true,
        center: true,
        resizable: false,
        skipTaskbar: true,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: false,
        },
        frame: false,
        show: false,
      },
    );
  }

  async initialize() {
    await PLExtAPI.extensionPreferenceService.register(
      this.id,
      this.defaultPreference,
    );

    try {
      this._createPreviewWindow();
    } catch (error) {
      PLAPI.logService.error(
        "Failed to create preview window",
        error as Error,
        true,
        "Preview",
      );
    }

    this.disposeCallbacks.push(
      PLMainAPI.windowProcessManagementService.on(
        "paperlib-preview-extension-window",
        (newValues: { value: string }) => {
          if (newValues.value === "blur") {
            PLMainAPI.windowProcessManagementService.hide(
              "paperlib-preview-extension-window",
            );
          }
        },
      ),
    );

    this.disposeCallbacks.push(
      PLMainAPI.menuService.onClick("View-preview", async () => {
        PLMainAPI.windowProcessManagementService.show(
          "paperlib-preview-extension-window",
        );
      }),
    );
  }

  async dispose() {
    for (const disposeCallback of this.disposeCallbacks) {
      disposeCallback();
    }
    PLExtAPI.extensionPreferenceService.unregister(this.id);
  }
}

async function initialize() {
  const extension = new PaperlibPreviewExtension();
  await extension.initialize();

  return extension;
}

export { initialize };
