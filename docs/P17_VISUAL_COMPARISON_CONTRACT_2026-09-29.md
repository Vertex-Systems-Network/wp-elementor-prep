# P17 visual comparison and Web-to-Figma boundary — 2026-09-29

Status: CONTRACT DEFINED / CALIBRATED SOURCE EVIDENCE PENDING

This contract separates a controlled browser render from visual fidelity and from Web-to-Figma reconstruction. It does not promote local rendering, DOM checks or an HTML/CSS package into parity evidence.

## Evidence layers

| Layer | What it can prove | What it cannot prove |
|---|---|---|
| Static package validation | Schema, file closure, deterministic hashes, blocked features and asset manifest consistency | Browser layout, font rendering or visual fidelity |
| Controlled browser render | The generated package loads at a declared viewport and produces an observable DOM/render receipt | Match to Figma without a bound source reference |
| Source-bound comparison | Measured geometry/pixel/channel comparison against a genuine source capture bound to the exact IR hash | Production acceptance, arbitrary viewport coverage or target-builder compatibility |
| Web-to-Figma reconstruction | A new Figma reconstruction can be generated from supported static HTML/CSS inputs | Mutation of the original design, semantic equivalence of unsupported CSS or JavaScript behavior |
| Production acceptance | Explicit target/runtime decision with retained release evidence | Universal support for other browsers, frameworks or templates |

## Required comparison receipt

A valid visual-comparison receipt must contain:

- exact source IR SHA-256 and generated artifact SHA-256;
- genuine source reference file hash and declared viewport/device scale;
- generated render capture hash and capture metadata;
- explicit browser/runtime version;
- geometry, text/content, asset-load and pixel/channel metrics;
- calibrated thresholds and the calibration record used;
- visualComparison: PASS, REVIEW or BLOCKED;
- failure reasons and missing-evidence list.

A source screenshot must be obtained from the approved design/runtime path. A hand-authored, synthetic or unrelated screenshot cannot be used to manufacture a PASS result.

## Boundary rules

- No visual comparison is run when the IR hash, viewport or source reference is missing or mismatched.
- No arbitrary JavaScript executes in the deterministic core for reconstruction.
- Unsupported CSS, remote assets, external fonts, scripts, routing and data/API behavior remain explicit REVIEW/BLOCKED items.
- Web-to-Figma output is always a new reconstruction; it never silently mutates the approved source.
- A local Chrome receipt is useful runtime evidence but is not by itself Figma parity or production acceptance.
- Responsive claims require separately declared source references; the system must not invent tablet/mobile compositions.

## Next evidence required

1. Retain a genuine source capture bound to the exact accepted IR.
2. Run the controlled comparison at declared viewport(s) with the exact generated artifact.
3. Review threshold calibration and classify any drift as PASS/REVIEW/BLOCKED.
4. Add a separate static Web-to-Figma fixture only for the documented supported HTML/CSS subset.
5. Keep P15/P16 target validation and P12/P27 release gates independent.
