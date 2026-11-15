// MetalliCSS (MIT) ships no types. It renders a metallic canvas surface into an element,
// sized to it and following its border-radius; configured with the CSS custom properties
// --metal (silver by default, gold, copper, lead, neutral) and --convexity.
declare module "metallicss" {
  export const metallicss: (elem: HTMLElement) => void;
}
