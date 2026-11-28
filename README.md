# LoanSharks Coxmas

LoanSharks Coxmas is a three-page Old School RuneScape site for a Chambers of Xeric bingo event. Each tab is a separate HTML document. The site runs directly on GitHub Pages with plain HTML, CSS, and JavaScript. Relative paths resolve from the repository's Pages URL. Publish the three HTML files alongside the `assets/`, `css/`, and `js/` directories.

## Architecture

| Feature | Source | Responsibility |
| --- | --- | --- |
| Board and rules | [index.html](./index.html), [board.js](./js/board.js) | The page holds event rules and prizes. Its script renders nine buttons, flips a tile, and announces its rule. |
| Tile definitions | [tiles.js](./js/tiles.js) | Board order, names, rules, goals, and front and back image paths. The leaderboard matches sheet headers by tile name. When changing rule wording, update the matching back image if its lettering changes. |
| Leaderboard | [progress.html](./progress.html), [leaderboard.js](./js/leaderboard.js) | Renders the clan overview and individual boards, handles refresh and cross-tab updates, and preserves shareable player URLs. |
| Tracker data | [tracker-data.js](./js/tracker-data.js), [tracker-snapshot.js](./js/tracker-snapshot.js) | Fetches the published Google Sheets HTML, validates rows, scores boards, and selects a saved or bundled snapshot. |
| Calendar | [calendar.html](./calendar.html), [calendar.js](./js/calendar.js), [sealed-riddles.js](./js/sealed-riddles.js) | Renders 31 doors and decrypts each released riddle when opened. Paste published key entries into `RELEASED_DOORS` in the HTML as the event progresses. |
| Shared presentation | [site.css](./css/site.css), [winter.css](./css/winter.css) | All pages share fonts and tab styling. The board and calendar also share snow, corner decorations, and animated scene styling. Each page has a separate stylesheet for its layout. |

## Artwork, type, and sound

The [images directory](./assets/images/) contains tile artwork, PNG sprites, and animated WebP assets. Both board views use the same front images. CSS backgrounds reference scene artwork relative to the stylesheet. The regular and bold RuneScape faces from RuneLite live in [fonts](./assets/fonts/). Selected sprites use pixelated scaling.

The board loops *Scape Santa* and the calendar loops *A Festive Party*. Each page selects its track in its audio element. [music.js](./js/music.js) handles the shared mute preference and retries playback after interaction when autoplay is blocked. The recordings and OSRS game art are by Jagex. [Scape Santa](https://oldschool.runescape.wiki/w/Scape_Santa) · [A Festive Party](https://oldschool.runescape.wiki/w/A_Festive_Party)

## How the scenes are animated

The board and calendar use [snowball.js](./js/snowball.js) to drive the same throw. The thrower, target, and Olm use horizontal sprite strips. A single animation loop selects their frames and computes the projectile's path from the actors' rendered positions. Olm watches the impact and turns back before the next windup.

The calendar rider uses six frames from OSRS sequence 1462 at 80 ms per frame. [calendar.css](./css/calendar.css) moves the sled along the snowbank and varies the following Olmlet's position. Reduced-motion settings hide the sled and falling snow and stop the snowball throw.

## Data and browser state

**Leaderboard.** The parser locates the `Tile Progress` header, matches the nine tile columns by name, and validates each count against its tile goal. It evaluates the eight possible bingo lines and identifies both completed lines and tiles that would finish a line.

The visible leaderboard polls once a minute. When a response differs from the displayed board, a second fetch must return matching counts before the page accepts the update. Accepted snapshots go into local storage. Other tabs can adopt a newer snapshot through a storage event. A failed refresh keeps the displayed progress and shows its timestamp.

**Calendar.** The browser reads the first 12 bytes of the selected encrypted payload as the initialization vector and decrypts the remainder with AES-GCM. Local storage remembers which doors that browser has opened. Future release keys stay with the host until their doors are ready.
