# Archived paper-plane illustration

The landing screen now uses an animated CRM workflow in
`frontend/src/components/illustrations/crm-workflow.tsx`. This earlier plane
concept and its screenshots are retained for reference. It is no longer shipped
in the application.

[Open the standalone paper-plane demo](hairline-paper-plane.html). It works from
disk without a server. Press **play**, or open it with `?play=1`, to see the
original pointer tour: port wing, climb to starboard, bank down, return to rest.

The custom drawing uses the unchanged Hairline kernel and bench. Folded wings,
a recessed keel, and a paper-thickness edge carry the shape. Pointer movement
banks the plane and flexes its wings. Its rules are 01 (fixed input coordinates),
03 (bounded reach), 04 (one highlight), 05 (composed rest), 07 (sleeping loop),
08 (spring clock), and 09 (rounded outlines and quiet creases).

The original skill validator and browser look passed. The small silhouette,
paint order, motion sheet, frame limits, and both themes were reviewed. Its slim
silhouette occupies 22% of the frame at rest. The later ambient-flight revision
was not checked in a browser, at the user's request.

The engine supplied by the `hairline-create` skill comes from
[lucasmarkes/hairline](https://github.com/lucasmarkes/hairline), covered by the
accompanying [MIT license](LICENSE), copyright 2026 Lucas Marques. The standalone
HTML contains the custom figure, kernel, and bench. The figure was created with
AI assistance for this project.

All prior application screenshots and Hairline preview sheets remain in
[the screenshot collection](../screenshots/README.md).
