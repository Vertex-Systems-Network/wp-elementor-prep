# P18 framework adapter R0 matrix — 2026-09-29

Status: RESEARCH REFRESH / IMPLEMENTATION NOT CLAIMED

This record extends the existing P18 React first-slice review. It is a dated compatibility preflight for future adapters; it does not certify any framework, target import, visual parity, or production readiness.

## Official observations

| Candidate | Official contract observed | Adapter consequence |
|---|---|---|
| Next.js | App Router supports layouts, navigation, server/client components; static export produces HTML per route at build time. | Treat Next.js as a React-derived project adapter with an explicit router/rendering mode. Do not infer routing, server components, data fetching, or static export from a Figma frame. |
| Vue | Vue Single-File Components encapsulate template, logic and styles in `.vue` files and require the Vue toolchain. | A Vue adapter needs its own SFC emitter, compiler/build fixture and source-bound render receipt; React TSX output is not Vue evidence. |
| Svelte | Svelte components are compiler inputs written in `.svelte` files using HTML, CSS and JavaScript. | A Svelte adapter needs compiler-pinned output and a separate runtime/build receipt; static HTML similarity is insufficient. |
| Angular | Angular components combine a TypeScript class, HTML template and selector; the official workflow uses Angular CLI/tooling. | An Angular adapter must emit component metadata and template/style files under a pinned CLI/toolchain; generic TSX or HTML is not Angular compatibility. |
| Astro | Astro is not included in this refresh because no retained official source was needed for the current bounded slice. | Keep Astro explicitly unimplemented until a dated official-source review and fixture are added. |
| NestJS | NestJS is a backend Node framework, not a browser visual renderer. | Never expose “design to NestJS UI”; only consider a separately specified backend/API scaffold paired with a front-end adapter. |

## Capability matrix

| Capability | Next.js | Vue | Svelte | Angular | Astro |
|---|---|---|---|---|---|
| Static presentational component | REVIEW | REVIEW | REVIEW | REVIEW | NOT_REVIEWED |
| Deterministic source-ID provenance | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED |
| Router/server/data inference | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| JavaScript/event generation from appearance | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Missing or remote asset substitution | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Pinned build and controlled browser render | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED |
| Figma visual parity | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN |
| Production acceptance | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN | NOT_RUN |

## Next bounded implementation order

1. Keep the current `react-web` adapter as the only implemented framework slice.
2. Add one pinned fixture at a time, beginning with Next.js only if its rendering mode is explicitly selected.
3. Add Vue, Svelte and Angular only with framework-specific emitters, compiler/build locks and source-bound receipts.
4. Add Astro after a dedicated R0 review.
5. Reuse the neutral Web IR, but do not reuse a renderer's acceptance result across frameworks.

## Evidence boundary

Official documentation establishes capability and authoring constraints only. It does not prove that generated output compiles, renders, matches Figma, handles assets, or is accepted by a production target. Those claims require the framework-specific fixture, exact dependency lock, build log, controlled render receipt and separately calibrated visual comparison.

## Sources

- React: https://react.dev/
- Next.js App Router: https://nextjs.org/docs/app
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- Vue SFC: https://vuejs.org/guide/scaling-up/sfc.html
- Svelte components: https://svelte.dev/docs/svelte/svelte-files
- Angular components: https://angular.dev/guide/components
- Angular installation/tooling: https://angular.dev/installation
