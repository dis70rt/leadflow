# LeadFlow illustrations

[Open the standalone paper-plane demo](hairline-paper-plane.html). It works from
disk without a server. Press **play**, or open it with `?play=1`, to watch the
flight. The standalone bench demonstrates pointer banking. The landing screen
uses the same figure in an automatic flight mode with the application theme.

The plane's folded wings, recessed keel, and paper-thickness edge carry the
shape. The pointer banks the plane and flexes the nearer wing. Default springs
smooth continuous input; leaving returns it to its resting bank. The flight tour
visits the port wing, climbs to starboard, banks down, then returns to rest.

The drawing follows Hairline rules 01 (fixed input coordinates), 03 (bounded
reach), 04 (one stroke highlight), 05 (composed rest), 07 (sleeping frame loop),
08 (spring clock), and 09 (rounded outlines and quiet creases). Its slim
silhouette occupies 22% of the frame at rest; its proportions preserve the paper
plane's folded shape. The figure stays inside the frame at both intensity limits.

The skill's validator and browser look passed. The small silhouette shows both
folded wings and the keel; the motion sheet shows stable folds and paint order.
The original pointer-based version was checked in Chromium in both themes.
The landing now uses a continuous twelve-second flight route with turning,
banking, wing flex, and a short trail. It has no caption or playback controls.
Browser checks were skipped for this revision at the user's request.

The ambient flight advances inside the Hairline frame loop, using SVG transforms
without React renders on each frame. The app adapter loads the engine once,
disposes the figure on unmount, and pauses the flight when offscreen or the tab
is hidden. Reduced-motion preferences stop
autoplay. A separate inline paper-plane SVG appears in the empty lead list and
serves as the landing illustration's loading/error fallback.

## Sources

The Hairline engine is an unchanged copy supplied by the `hairline-create` skill,
from [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline). It is covered
by the accompanying [MIT license](LICENSE), copyright 2026 Lucas Marques.
The application copy and license are in `frontend/public/illustrations/hairline`.
The custom plane figure is `paper-plane.js` in that directory. The standalone
HTML is generated with the skill's unmodified kernel and bench.

The figure, React adapter, and matching inline SVG were created with AI assistance
for this project. All application screenshots and Hairline preview sheets are
retained in [the screenshot collection](../screenshots/README.md).
