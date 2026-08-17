import { Prism } from "prism-react-renderer";

/**
 * Registers the grammars prism-react-renderer does NOT bundle.
 *
 * The package vendors a cut-down Prism with 53 grammars, and bash / powershell / ini are
 * not among them — which is why those blocks rendered as plain text: `<Highlight>` finds
 * no grammar for the language and silently emits one untokenised line.
 *
 * The grammar files are side-effect scripts that read the bare global `Prism`
 * (`(function (Prism) { ... }(Prism))`, and prism-ini assigns to it directly), so
 * `globalThis.Prism` must point at the vendored instance before they run.
 */

/** Grammars loaded here. Add a language by extending this list and the imports below. */
const LANGUAGES = ["bash", "powershell", "ini", "perl"] as const;

let registration: Promise<void> | null = null;

export function registerPrismLanguages(): Promise<void> {
  // One shared promise: an article with a dozen code blocks registers once, and concurrent
  // callers await the same work instead of racing to mutate Prism.languages.
  registration ??= (async () => {
    // MUST precede the imports below. They are dynamic for exactly this reason: static ES
    // imports are hoisted above module-body statements, so a top-level
    // `import "prismjs/components/prism-bash"` would execute before this line and throw
    // `ReferenceError: Prism is not defined`.
    (globalThis as { Prism?: unknown }).Prism = Prism;

    // Independent of one another (none extends another), so parallel loading is safe.
    await Promise.all([
      import("prismjs/components/prism-bash"),
      import("prismjs/components/prism-powershell"),
      import("prismjs/components/prism-ini"),
      import("prismjs/components/prism-perl"),
    ]);

    // A silent registration failure is precisely the bug being fixed here, so make it loud
    // rather than quietly falling back to plain text again.
    const missing = LANGUAGES.filter((lang) => !Prism.languages[lang]);
    if (missing.length > 0) {
      console.error(`Prism grammars failed to register: ${missing.join(", ")}`);
    }
  })().catch((err) => {
    // Don't cache a failure — let a later mount retry (e.g. a transient chunk 404).
    registration = null;
    throw err;
  });

  return registration;
}
