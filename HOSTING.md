# Hosting the Travel Distance Calculator on your own domain

This is a static website: plain HTML, CSS and JavaScript. There is nothing to install, build or run on the server, and no database.

## What this is

A page for the **Carbon Markets Africa Summit 2026 carbon footprint survey**. It shows the Cognito Forms survey with a **distance calculator** beside it, so delegates can work out the distance of each journey instead of calculating it themselves. The survey itself still runs on Cognito Forms; the answers are saved in the Cognito account, exactly as before.

## Files

| File | What it is |
|---|---|
| `index.html` | **The survey page** (the Cognito form plus the calculator). This is the page delegates should open. |
| `calculator.html` | The calculator on its own. It is loaded inside `index.html`, so it must be uploaded too. |
| `guide.html` | A user guide (optional) |
| `survey.html` | Old address of the survey page. It redirects to `index.html` (optional) |

## How to host it

1. Upload the files to a folder on the web server, for example `https://yourdomain.org/distance/` (or the site root). Keep the files together in the same folder.
2. Open `https://yourdomain.org/distance/` (or `.../index.html`). You should see the survey form with the calculator beside it.
3. Give delegates that address as the survey link.

All links between the files are relative, so it works in any folder. The site must be served over **HTTPS**.

## What the page loads from outside (allow these if the site has a Content Security Policy or firewall)

| Address | Used for |
|---|---|
| `www.cognitoforms.com` | The survey form and its submission |
| `photon.komoot.io` | Place suggestions while typing |
| `nominatim.openstreetmap.org` | Looking up a place name that was typed but not chosen |
| `router.project-osrm.org` | Driving distances |
| `fonts.googleapis.com`, `fonts.gstatic.com` | The form's font (Open Sans Condensed) |

If any of these is blocked, that part stops working: for example, blocking `photon.komoot.io` removes the suggestions, and blocking Cognito removes the form.

The page does not set cookies of its own and does not store anything about delegates. Survey answers go straight to Cognito. The place names typed into the calculator are sent to the free map services listed above only to find the distance.

## After uploading: please test

1. Open the page on a computer and on a phone. The form should appear with its title, and the calculator should work.
2. Type a place in the calculator and choose a suggestion (e.g. "Cape Town International Airport"), do the same for the destination, and click **Calculate distances**.
3. Ask the survey owner to submit **one test entry** using fake details, and check that it appears in the Cognito entries. Then delete the test entry.

## If something doesn't work

| Problem | Likely cause |
|---|---|
| The form doesn't appear | `www.cognitoforms.com` is blocked, or the page isn't over HTTPS |
| The calculator box is empty | `calculator.html` wasn't uploaded in the same folder as `index.html` |
| No place suggestions | `photon.komoot.io` is blocked |
| "No driving route" or slow results | The free route service is busy; try again in a minute |
| Page looks old after an update | Browsers keep a copy for a few minutes; refresh with Ctrl + F5 |

## Notes

- The distance services are free and shared, with no uptime guarantee. That is fine for a few hundred delegates. For heavier use, a paid service can replace them.
- Distances are estimates for carbon footprint reporting.
- Contact: Hlulani Mathebula, Vuka (hlulani.mathebula@wearevuka.com).
