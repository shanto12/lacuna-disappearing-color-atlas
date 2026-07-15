# LACUNA production release evidence

This matrix records the release gates for the public LACUNA experience. Exact final commit, CI run, deployment ID, and immutable URL are published with the [latest GitHub release](https://github.com/shanto12/lacuna-disappearing-color-atlas/releases/latest).

## Release surfaces

- Production: <https://lacuna-disappearing-color-atlas.netlify.app>
- Public source: <https://github.com/shanto12/lacuna-disappearing-color-atlas>
- Private Sites parity mirror: `lacuna-atlas-2026.shanto.chatgpt.site`
- Verification timezone: America/Chicago (Central Time)

## Evidence matrix

| Requirement | Result | Current evidence |
|---|---|---|
| Local quality gates | Pass | ESLint, TypeScript, rendered HTML tests, Sites build, native Netlify build, and dependency audits pass from the locked install. |
| GitHub source and CI | Pass | Repository is public; the release workflow runs the complete locked verification suite on every push and pull request. |
| Netlify production, not only localhost | Pass | Production and immutable deploy URLs return the complete experience. Root, social image, robots, and sitemap return `200`; an unknown route returns the intended `404`. |
| Real Chrome profile | Pass | The final manual pass uses the signed-in desktop Chrome profile, not an isolated test browser. |
| Every visible primary control | Pass | Verified: skip link; wordmark; index open/close; all six index destinations; pause/resume; begin; first-light reveal; previous/next film frames and both boundaries; rain distillation; borrowed-hour linger; specimen creation; travel again; and footer return. |
| Keyboard and focus | Pass | Skip-link activation focuses the story; index navigation closes the disclosure and focuses the destination heading. Native buttons and links retain semantic keyboard behavior. |
| Motion accessibility | Pass | Persistent pause/resume works across reload; `prefers-reduced-motion` and forced-colors adaptations ship in production. |
| Desktop layout | Pass | 1440×1000 real-Chrome inspection covers the hero and every lower chapter with zero horizontal overflow. |
| Mobile layouts | Pass | 390×844 and 320×760 real-Chrome checks have zero horizontal overflow and no interactive target smaller than 44px. |
| Runtime boundedness | Pass | Repeating specimen creation 20 times leaves the DOM node count unchanged and retains exactly one Canvas renderer. |
| Console and first-party assets | Pass | No site-origin errors or warnings; all rendered first-party assets return `200`. Chrome-extension warnings, when present, are recorded separately and excluded from site results. |
| Security headers and CSP | Pass | CSP, COOP, permissions policy, strict referrer policy, HSTS, `nosniff`, and framing denial are present on HTML and metadata routes. |
| Social and search metadata | Pass | Fixed production canonical, Open Graph and Twitter metadata, 1200×630 bespoke social card, robots, and sitemap are verified. |
| Production dependency audit | Pass | `npm audit --omit=dev` reports zero vulnerabilities. |
| Full dependency audit | Pass | Lockfile-only remediation leaves the full dependency tree at zero known vulnerabilities. |
| Secret hygiene | Pass | Tracked source and history scans contain no credentials or sensitive artifacts. |
| Authentication and logout/login | N/A | The experience intentionally has no accounts or protected areas. |
| Password-manager behavior | N/A | There are no credential fields. |
| Forms | N/A | There are no submission forms. |
| Runtime APIs, jobs, or backend runners | N/A | The experience is deterministic and client-side; there are no application API calls, jobs, databases, or task runners. |

## Interaction architecture

LACUNA keeps animation bounded to one procedural Canvas field and a finite React state model. Every meaningful visual state is reachable with native semantic controls. Motion is independently pausable, visitor preference is persisted locally, and the experience remains complete when reduced-motion is requested.
