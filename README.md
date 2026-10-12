# Travel Distance Calculator and Delegate Travel Survey

A mobile-friendly survey page for the **Carbon Markets Africa Summit 2026 Delegate Travel Survey**, with a built-in distance calculator so delegates don't have to work out distances themselves. Reusable for other events.

## Links

| What | Link |
|---|---|
| **Live survey (the link delegates use)** | https://carbonmarketsafrica.com/carbon-footprint-survey/ |
| **GitHub-hosted version (what the live page shows)** | https://vukaai-lab.github.io/cmas-travel-distance/ |
| GitHub version in test mode (sends nothing) | https://vukaai-lab.github.io/cmas-travel-distance/?dryrun=1 |
| The calculator on its own | https://vukaai-lab.github.io/cmas-travel-distance/calculator.html |
| User guide | https://vukaai-lab.github.io/cmas-travel-distance/guide.html |
| The Google Form that receives the answers | https://docs.google.com/forms/d/e/1FAIpQLScJ_S-6Dh4hIuMLgxfxoDt4w7gUmA2Fyx4hX-aWsYMERSiz0g/viewform |

**How the two survey links relate:** the live page on the Carbon Markets Africa website shows the GitHub-hosted version inside a frame. So the GitHub-hosted version *is* what the live page displays: any change pushed to this repository (`main` branch) appears on the live page within a couple of minutes (browsers may keep an old copy for a few minutes; refresh with Ctrl + F5). To compare them, open both links side by side. The live page adds the Carbon Markets header, banner and footer around it, and the GitHub version shows its own copy of those.

**Status:** the page went live on 12 October 2026 as our own survey form that sends its answers to the Google Form above. Earlier versions are kept as `google-embed.html` and `cognito.html`.

Hosting this on your own domain? See [HOSTING.md](HOSTING.md).

## How it fits together

- The page is **our own form** (`index.html` + `survey.js` + `survey-data.js`). It shows the survey one short page at a time, with the same questions, required fields and branching as the Google Form.
- When a delegate submits, the answers are **sent to the survey's Google Form**, so they arrive in that form's Responses / Google Sheet for whoever owns the form. Nothing is stored on our side.
- Under each distance question there is a **"Calculate for me"** button. It opens the calculator in place (`calculator.html`), pre-filled with the delegate's city and the venue where possible and with the transport mode from their earlier answer. "Use ... km in the survey" fills in the box. For the daily-travel question the calculator adds up several trips, there and back.
- The header, banner and footer copy the look of the Carbon Markets Africa website (their logo and photos load from `carbonmarketsafrica.com`). When the page is shown inside another website's page, it hides its own header, banner and footer.

## How distances are calculated

| Mode | Method |
|---|---|
| Air | Straight-line (great-circle) distance between the two places |
| Ferry | Straight-line distance, as for air |
| Vehicle | Driving route distance |
| Rail | Estimated as the driving distance plus 5%, since there is no free rail routing |

Distances are one-way unless the question asks otherwise. They are estimates for carbon footprint reporting, not navigation.

## Data sources

The page calls these free public services from the visitor's browser:

- **Google Forms** (`docs.google.com`) receives the survey answers.
- **[Photon](https://photon.komoot.io/)** (OpenStreetMap data) provides the as-you-type place suggestions. A picked suggestion carries its own coordinates.
- **[Nominatim (OpenStreetMap)](https://nominatim.org/)** turns place names that were typed but not picked into coordinates.
- **[OSRM](https://project-osrm.org/)** (public demo server) returns driving distances.

The map services are shared and rate-limited, with no uptime guarantee. That is fine for a few hundred delegates; for heavier use, switch to a paid provider.

## Files

| File | Purpose |
|---|---|
| `index.html` | **The survey page** (layout, branding, styling). Open and share this. |
| `survey.js` | The survey engine: pages, branching, checks, sending the answers, calculator hooks |
| `survey-data.js` | The questions, Google field ids, options and branching, **generated from the Google Form** |
| `calculator.html` | The calculator. Modes: default, `?embed=1&pick=1` (inside the survey), `&multi=1` (several trips added up), `?panel=1` (older side panel) |
| `guide.html` | A generic user guide |
| `HOSTING.md` | Notes for hosting on another domain |
| `survey.html`, `survey-form.html`, `survey-google.html` | Old addresses; redirect to `index.html` |
| `google-embed.html` | The previous version, which showed the Google Form in a frame (backup) |
| `cognito.html` | The version from before that, using a Cognito form (backup) |

## Keeping it in step with the Google Form

`survey-data.js` is a copy of the Google Form's questions. **If the Google Form is changed (questions added, renamed, removed, or options changed), `survey-data.js` must be regenerated**, otherwise answers can be rejected or land in the wrong place. Add `?dryrun=1` to the page address to see exactly what would be sent without sending anything.

## Testing

- `index.html?dryrun=1` runs the whole survey and shows the answers that would be sent, without sending them.
- A real submission creates a real response in the Google Form: tell the form owner first, use fake details (e.g. name "TEST DELETE"), and have it deleted afterwards.

## Configuration

`VENUE_DEFAULT` near the top of the script in `calculator.html` can pre-fill a default destination in the stand-alone calculator. The venue names used by the survey (Kigali Convention Centre, Kigali International Airport) are at the top of `survey.js`.

## Owner

Vuka AI Lab (https://github.com/VukaAI-lab).
