# Receipt

A static daily guessing game: infer an activity from a shopping receipt in six guesses. Type a guess and press Enter to submit it; each incorrect guess reveals another item. Open `index.html` locally or serve this directory with any static web server. No build step or server-side service is required.

## GitHub Pages

Push these files to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, and save. The site works at either a root domain or a repository subpath.

## Puzzles and progress

`game.js` contains the hand-authored puzzle bank and accepted answers. The UTC calendar day deterministically selects a puzzle; the small bank cycles, so add and playtest more puzzles before a wider launch. Each puzzle has eight ordered items and accepted normalized answer phrases. Prices are decorative. Adding or reordering puzzles changes the schedule, so avoid doing so during a live day.

Guesses and completed results are saved in the browser's local storage, per UTC date. They do not sync across devices or survive clearing site data. Answers are in the client code, so this is not cheat-proof. There is no analytics or backend.
