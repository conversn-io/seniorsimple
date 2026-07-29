# Medicare Capture Lead Magnets — PLACEHOLDERS

These files are referenced by `src/lib/medicare-capture-config.ts` (`MAGNETS`).
Drop the finished PDFs in this directory before launch. Filenames MUST match:

| magnetId       | File                                    | Referenced by                                     |
| -------------- | --------------------------------------- | ------------------------------------------------- |
| `decision-kit` | `medicare-decision-kit-2026.pdf`        | glp1, medigap, advantage, part-d pages            |
| `tool-result`  | `medicare-estimate-template.pdf`        | Cost calculator, comparison tool                  |
| `starter-guide`| `medicare-starter-guide.pdf`            | Medicaid vs Medicare, open-enrollment pages       |

Copy source: `3_Medicare_Lead_Magnets.md` (Keenan is preparing).

Until the PDFs are dropped in, the download button in the capture unit success
state will 404 — that's OK for a staging demo. Do NOT ship to prod without them.
