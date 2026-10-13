export interface HairlineFigure {
  name: string;
  means: string;
  range: [number, number, number];
  tour: ([number, number] | null)[];
  mount(
    host: {
      stage: HTMLElement;
      svg: SVGElement;
      read: { textContent: string };
    },
    value: number,
  ): { set(value: number): void; destroy(): void };
}
interface HairlineKernel {
  inject(root: Document): void;
  mk(
    tag: "svg",
    attributes: Record<string, string>,
    parent: HTMLElement,
  ): SVGElement;
  setReducedMotion(reduced: boolean): void;
}
declare global {
  interface Window {
    HL?: HairlineKernel;
    hairline?: (figure: HairlineFigure) => void;
  }
}
let loading:
  Promise<{ kernel: HairlineKernel; figure: HairlineFigure }> | undefined;

function loadScript(src: string, module = false) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (module) script.type = "module";
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("The illustration could not load."));
    };
    document.head.append(script);
  });
}

export function loadPaperPlane() {
  loading ??= (async () => {
    if (!window.HL) await loadScript("/illustrations/hairline/kernel.js");
    const kernel = window.HL;
    if (!kernel) throw new Error("The illustration engine could not load.");
    const registration: { figure?: HairlineFigure } = {};
    window.hairline = (figure) => {
      registration.figure = figure;
    };
    try {
      await loadScript("/illustrations/hairline/paper-plane.js", true);
    } finally {
      delete window.hairline;
    }
    if (!registration.figure)
      throw new Error("The illustration could not load.");
    return { kernel, figure: registration.figure };
  })();
  return loading;
}
