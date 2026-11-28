# LoanSharks Coxmas

LoanSharks Coxmas is a three-page, Old School RuneScape–themed site for a Chambers of Xeric bingo event. The board is an interactive pixel-art scene, the leaderboard turns spreadsheet counts into player boards, and the Advent(ure) Calendar reveals riddles as their keys are published. All three use plain HTML, CSS, and JavaScript.

## Architecture

Each tab is a link to a separate HTML document. Each document carries its own markup, styles, scripts, and media. The browser handles rendering, scoring, animation, and riddle decryption. The leaderboard’s live data comes from a published Google Sheets tab.

| Source | Responsibility | Code to follow |
| --- | --- | --- |
| [index.html](./index.html) | Bingo board, tile rules, and animated holiday scene | Each tile is a button with a `data-rule` attribute. Its click handler updates `aria-pressed` and the rule text. Search for `animateThrow` to follow the snowball scene. |
| [progress.html](./progress.html) | Sheet ingestion, scoring, player cards, and refresh state | `loadRows` fetches the sheet, `tableRows` extracts cells from the published HTML, `playersFromRows` validates counts, and `score` evaluates the board. |
| [calendar.html](./calendar.html) | Door grid, riddle dialog, and sled scene | `SEALED_RIDDLES` holds the encrypted payloads. Entries in `RELEASED_DOORS` enable individual doors. The click handler decrypts the selected riddle with Web Crypto. |

## Artwork, type, and sound

Media is stored directly in the source as Base64 data URLs. Image elements and CSS backgrounds reference embedded PNG and WebP artwork. Each page also defines regular and bold RuneScape TrueType faces with `@font-face`. Selected sprites use `image-rendering: pixelated` to keep hard edges when scaled.

| Page | Embedded media | HTML size¹ |
| --- | --- | ---: |
| Board | 50 PNGs, 1 WebP, 2 fonts, 1 audio track | 8.90 MB |
| Leaderboard | 9 PNGs, 2 fonts | 2.05 MB |
| Calendar | 10 PNGs, 3 WebPs, 2 fonts, 1 audio track | 6.04 MB |

¹ Uncompressed file sizes. Counts are embedded references, so artwork reused across pages is counted on each page. Base64 payloads account for over 99% of each document. This packaging keeps the scene and its media together when a page is copied. It also means that changing shared typography or artwork requires updating each page that embeds it.

The board loops *Scape Santa* and the calendar loops *A Festive Party*. Both pages use an HTML audio element, remember the mute preference in local storage, and retry playback after interaction when the browser blocks autoplay. The HTML comments credit the music to Jagex and record the source pages. [Scape Santa](https://oldschool.runescape.wiki/w/Scape_Santa) · [A Festive Party](https://oldschool.runescape.wiki/w/A_Festive_Party)

## How the scenes are animated

**Snowball throw.** The thrower, target, and Olm use horizontal sprite strips. The `pose` function selects one of 20 frames by changing the background position. A single `requestAnimationFrame` loop drives the thrower’s windup, the projectile’s arc, the target’s reaction, and Olm’s gaze. The arc uses the actors’ rendered positions, so the snowball still reaches its target as the board changes width. Olm holds its gaze through impact and turns back before the next throw.

**Calendar sled.** The rider artwork uses six frames from OSRS sequence 1462 at 80 ms per frame. CSS keyframes move the sled along the snowbank and vary the following Olmlet’s position. The rider’s animation and the sled’s movement across the page run independently. Reduced-motion styles hide the sled run and falling snow.

## Data and browser state

**Leaderboard.** The parser locates the `Tile Progress` header and matches the nine tile columns by name. Each player row supplies counts such as `1/3`. The scorer compares those counts with tile goals across the eight possible bingo lines. It identifies both completed lines and the specific tiles that would finish a line.

The visible leaderboard polls once a minute. When a response differs from the displayed board, a second fetch must return matching counts before the page accepts the update. Accepted snapshots go into local storage. A storage-event listener picks up newer snapshots from other tabs. If a fetch fails, the page displays the timestamp of the saved or bundled snapshot.

**Calendar.** A door’s release depends on its published key. When someone opens a released door, the browser decodes its payload, reads the first 12 bytes as the initialization vector, and decrypts the remainder with AES-GCM. Local storage remembers which doors that browser has opened. Future release keys stay with the host until their doors are ready.
