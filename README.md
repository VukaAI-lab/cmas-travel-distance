# Travel Distance Calculator

A small web tool that lets event delegates work out how far they travelled, so they don't have to calculate distances themselves. Built for the **Carbon Markets Africa Summit 2026 carbon footprint survey** (run on Cognito Forms), and reusable for any event.

**Live survey page (form + calculator):** https://vukaai-lab.github.io/cmas-travel-distance/

Hosting this on your own domain? See [HOSTING.md](HOSTING.md).

## What delegates see

The survey page shows the Cognito survey with the distance calculator beside it (on a phone, the calculator opens from a floating "Distance calculator" button).

1. Type where each journey **starts** and **ends** (an address, place, hotel or airport) and pick the match from the suggestions that appear as you type.
2. Choose the mode of transport: Air, Rail, Vehicle or Ferry.
3. Click **Calculate distances**. The tool shows the one-way distance in km for each journey, which places it matched, and a total.
4. Copy the figure into the "One-way distance travelled" field in the survey and submit.

Journeys chain: clicking **Add journey** pre-fills the new journey's "From" with the previous journey's "To".

If a place can't be found, the tool explains why and suggests similar places to tap.

## How distances are calculated

| Mode | Method |
|---|---|
| Air | Straight-line (great-circle) distance between the two places |
| Ferry | Straight-line distance, as for air |
| Vehicle | Driving route distance |
| Rail | Estimated as the driving distance plus 5%, since there is no free rail routing |

All distances are **one-way**, matching the survey question. They are estimates for carbon footprint reporting, not navigation.

## Data sources

No map or place data is stored in this project. The page calls these free public services from the visitor's browser:

- **[Photon](https://photon.komoot.io/)** (built on OpenStreetMap data) provides the as-you-type place suggestions. A picked suggestion carries its own coordinates, which is the most accurate path.
- **[Nominatim (OpenStreetMap)](https://nominatim.org/)** turns place names that were typed but not picked into coordinates.
- **[OSRM](https://project-osrm.org/)** (public demo server) returns driving distances.

Limitations:
- These are shared, rate-limited services with no uptime guarantee. Fine for a few hundred delegates; for heavier or standing use, switch to a paid provider such as Google Maps or Mapbox.
- Very specific street addresses in small towns may not be found. "City, Country" works best.

## Files

| File | Purpose |
|---|---|
| `index.html` | **The survey page**: the Cognito form with the calculator alongside. This is the page to open and share. |
| `calculator.html` | The calculator on its own. Modes: default, `?panel=1` (used inside `index.html`), `?embed=1` (compact single journey) |
| `guide.html` | A generic user guide for the survey and calculator |
| `survey.html` | Old address of the survey page; redirects to `index.html` |
| `HOSTING.md` | Notes for hosting on another domain |

Everything is static HTML, CSS and JavaScript with no build step and relative links, so the folder can be uploaded to any web host or sub-folder.

## Using it with the Cognito survey

`index.html` embeds the live Cognito form (using Cognito's official embed script). Submissions go to the same Cognito form and entries as the original link. The form's title is added by this page, because Cognito's embed doesn't include it. If the survey is renamed in Cognito, update the heading in `index.html` too.

The Cognito form ID and public key are in the `<script>` tag in `index.html`. To reuse the page for another Cognito form, replace `data-form`, `data-key` and the heading (Cognito: Share, then Embed).

**Inline option (needs Cognito editor access):** `calculator.html?embed=1` is a compact single-journey version. Add it in a Cognito Content field under the distance question, with the full address of where this page is hosted:

```html
<details><summary><strong>Not sure of the distance? Calculate it here</strong></summary>
<iframe src="https://YOUR-DOMAIN/PATH/calculator.html?embed=1" style="width:100%;height:420px;border:0" title="Distance calculator"></iframe>
</details>
```

This is untested: it depends on Cognito keeping the iframe in a Content field.

## Configuration

`VENUE_DEFAULT` near the top of the script in `calculator.html` can pre-fill the destination for a specific event. Leave it blank for the general, reusable version.

## Owner

Vuka AI Lab (https://github.com/VukaAI-lab).
