# Hosting the Travel Distance Calculator on your own domain

This is a static website: plain HTML, CSS and JavaScript. There is nothing to install, build or run on the server, and no database.

## What this is

A page for the **Carbon Markets Africa Summit 2026 Delegate Travel Survey**. It is our own mobile-friendly survey form, branded like the Carbon Markets Africa website (header, banner and footer), with a **distance calculator** that opens under each distance question so delegates don't have to work out distances themselves.

The answers are sent to the survey's **Google Form**, so they are saved in that form's Responses (and its linked Google Sheet), exactly as if the delegate had used the Google Form directly. Nothing is stored on this website.

## Files (keep them together in one folder)

| File | What it is |
|---|---|
| `index.html` | **The survey page.** This is the page delegates should open. |
| `survey.js` | The survey form's logic (pages, checks, sending the answers). Needed. |
| `survey-data.js` | The survey's questions and rules, generated from the Google Form. Needed. |
| `calculator.html` | The distance calculator. It opens inside the survey page. Needed. |
| `guide.html` | A user guide (optional) |
| `survey.html`, `survey-form.html`, `survey-google.html` | Old addresses; they redirect to `index.html` (optional) |
| `google-embed.html`, `cognito.html` | Earlier versions of the page (optional backups, not needed) |

## How to host it

1. Upload the files to a folder on the web server, for example `https://yourdomain.org/distance/` (or the site root).
2. Open that address. You should see the survey with the Carbon Markets Africa header and banner.
3. Give delegates that address as the survey link.

All links between the files are relative, so it works in any folder. The site must be served over **HTTPS**.

**If you put the page inside another page** (for example in a frame on a page that already has the site header, banner and footer), it detects this and hides its own header, banner and footer so they are not shown twice. The frame needs enough height for a survey page (about 1,300 px on a phone). To make the frame resize itself, add this small script to the surrounding page (change the part of the address in `indexOf` to match where the survey is hosted):

```html
<script>
window.addEventListener("message", function (e) {
  if (!e.data || e.data.type !== "cmas-survey-height") return;
  var f = document.querySelector('iframe[src*="cmas-travel-distance"]');   // or the address of the survey page
  if (f) f.style.height = e.data.height + "px";
});
</script>
```

## What the page uses from outside (allow these if the site has a Content Security Policy or firewall)

| Address | Used for |
|---|---|
| `docs.google.com` | Sending the survey answers to the Google Form |
| `photon.komoot.io` | Place suggestions while typing in the calculator |
| `nominatim.openstreetmap.org` | Looking up a place name that was typed but not chosen |
| `router.project-osrm.org` | Driving distances |
| `fonts.googleapis.com`, `fonts.gstatic.com` | The page fonts (Poppins and Lato) |
| `carbonmarketsafrica.com` | The logo and the banner photo (loaded from the Carbon Markets Africa website) |
| `images.squarespace-cdn.com` | The footer logos |

If any of these is blocked, that part stops working: blocking `docs.google.com` stops the answers from being sent, and blocking `photon.komoot.io` removes the suggestions.

The page does not set cookies of its own and does not store anything about delegates. Answers go straight to the Google Form. The place names typed into the calculator are sent to the free map services listed above only to find the distance.

## After uploading: please test

1. Open the page on a computer and on a phone. The survey should appear and the calculator should open under a distance question.
2. In the calculator, type a place, choose a suggestion, and press Calculate. "Use ... km in the survey" should fill the box.
3. Ask the form owner to submit **one test response** (fake details, e.g. name "TEST DELETE") and check in the Google Form's Responses that every answer arrived in the right column. Then delete the test response.

To see what would be sent without sending anything, add `?dryrun=1` to the page address.

## Keeping it in step with the Google Form

The survey page is a copy of the Google Form's questions (in `survey-data.js`). **If the questions in the Google Form are changed, tell Hlulani** so the page can be regenerated, otherwise answers could go to the wrong place or be rejected.

## If something doesn't work

| Problem | Likely cause |
|---|---|
| The page is blank or the survey doesn't appear | `survey.js` or `survey-data.js` wasn't uploaded in the same folder as `index.html` |
| The calculator box is empty | `calculator.html` wasn't uploaded in the same folder |
| "We couldn't send your answers" | The device is offline, or `docs.google.com` is blocked |
| No place suggestions | `photon.komoot.io` is blocked |
| The banner photo or logos are missing | `carbonmarketsafrica.com` or `images.squarespace-cdn.com` is blocked, or the image files were renamed on those sites |
| "No driving route" or slow results | The free route service is busy; try again in a minute |
| Page looks old after an update | Browsers keep a copy for a few minutes; refresh with Ctrl + F5 |

## Notes

- The distance services are free and shared, with no uptime guarantee. That is fine for a few hundred delegates. For heavier use, a paid service can replace them.
- Distances are estimates for carbon footprint reporting.
- Contact: Hlulani Mathebula, Vuka (hlulani.mathebula@wearevuka.com).
