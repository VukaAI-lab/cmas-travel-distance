# Travel Distance Calculator

A small web tool that lets event delegates work out how far they travelled, so they don't have to calculate distances themselves. Built for the **Carbon Markets Africa Summit 2026 carbon footprint survey** (run on Cognito Forms), and reusable for any event.

**Live tool:** https://vukaai-lab.github.io/cmas-travel-distance/

## How it works

1. The delegate types where each journey **starts** and **ends** (city and country, e.g. `Lagos, Nigeria`) and picks the mode of transport: Air, Rail, Vehicle or Ferry.
2. They click **Calculate distances**.
3. The tool shows the one-way distance in km for each journey, plus a total.
4. They type that figure into the "One-way distance travelled" field in the survey.

Journeys chain: clicking **Add journey** pre-fills the new journey's "From" with the previous journey's "To".

## How distances are calculated

| Mode | Method |
|---|---|
| Air | Straight-line (great-circle) distance between the two places |
| Ferry | Straight-line distance, as for air |
| Vehicle | Driving route distance |
| Rail | Estimated as the driving distance plus 5%, since there is no free rail routing |

All distances are **one-way**, matching the survey question.

## Data sources

No map or place data is stored in this project. It calls two free public services when the user clicks Calculate:

- **[Nominatim (OpenStreetMap)](https://nominatim.org/)** turns place names into coordinates.
- **[OSRM](https://project-osrm.org/)** (public demo server) returns driving distances.

Limitations:
- Both are shared, rate-limited services with no uptime guarantee. This is fine for a few hundred delegates. For heavier or standing use, switch to a paid provider such as Google Maps or Mapbox.
- Very specific street addresses in small towns may not be found. "City, Country" works best.
- Results are estimates suitable for carbon footprint reporting, not navigation.

## Using it with the Cognito survey

**Combined page (recommended):** https://vukaai-lab.github.io/cmas-travel-distance/survey.html

`survey.html` embeds the live Cognito form (using Cognito's official embed script) next to the calculator. On wide screens the calculator is a side card; on phones it's a floating "Distance calculator" button that opens a slide-up sheet. Submissions go to the same Cognito form and entries as the original link.

The form's title is added by this page, because Cognito's embed doesn't include it. If the survey is renamed in Cognito, update the heading in `survey.html` too. The Cognito form ID and public key are in the `<script>` tag in `survey.html`; to reuse the page for another Cognito form, replace `data-form` and `data-key` and the heading (Cognito: Share, then Embed).

**Calculator only:** `index.html` works on its own.

**Inline option (needs Cognito editor access):** `index.html?embed=1` is a compact single-journey version. Add it in a Cognito Content field under the distance question:

```html
<details><summary><strong>Not sure of the distance? Calculate it here</strong></summary>
<iframe src="https://vukaai-lab.github.io/cmas-travel-distance/?embed=1" style="width:100%;height:330px;border:0" title="Distance calculator"></iframe>
</details>
```

This is untested: it depends on Cognito keeping the iframe in a Content field.

## Files

- `index.html`: the calculator (HTML, CSS and JavaScript in one file, no build step). Modes: default, `?panel=1` (used inside `survey.html`), `?embed=1` (compact).
- `survey.html`: the Cognito survey with the calculator alongside.

## Hosting

Served with GitHub Pages from the `main` branch (root). To run it locally, open `index.html` in a browser.

## Configuration

`VENUE_DEFAULT` near the top of the script in `index.html` can pre-fill the destination for a specific event. Leave it blank for the general, reusable version.

## Owner

Vuka AI Lab (https://github.com/VukaAI-lab).
