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

Cognito's hosted forms don't allow custom scripts, so the calculator is a separate page. Add a line to the survey, near the Kilometres field:

> Not sure of the distance? Use our distance calculator (opens in a new tab), then type the result below.

## Files

- `index.html`: the whole tool (HTML, CSS and JavaScript in one file, no build step).

## Hosting

Served with GitHub Pages from the `main` branch (root). To run it locally, open `index.html` in a browser.

## Configuration

`VENUE_DEFAULT` near the top of the script in `index.html` can pre-fill the destination for a specific event. Leave it blank for the general, reusable version.

## Owner

Vuka AI Lab (https://github.com/VukaAI-lab).
