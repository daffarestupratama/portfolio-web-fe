/**
 * `@types/prismjs` declares the root module only, but the individual grammar files under
 * `prismjs/components/` are side-effect scripts with no exports and no declarations —
 * `strict` would reject importing them. They are loaded purely for their effect on
 * `globalThis.Prism`; see components/blocks/prism-languages.ts.
 */
declare module "prismjs/components/*";
