# README screenshot scenarios

Captured on 14 October 2026 from the current frontend, all in 16:9, with
device scale factor 1 and the Asia/Kolkata timezone. Overview images are
2560 × 1440; landing and dialog images are 1920 × 1080. These are viewport
captures, not tall full-page images or resized composites.

The lead, discussion, reminder, and status flows use a separate PostgreSQL database
through the real FastAPI API. They do not modify the application's existing leads.
Search captures use deterministic API response fixtures to demonstrate the autocomplete
UI; they are not evidence of a live Solr integration run.

| Capture | Scenario |
| --- | --- |
| [01-landing-dark.png](01-landing-dark.png) | Demo sign-in and animated CRM workflow, dark mode |
| [02-landing-light.png](02-landing-light.png) | The same landing screen in light mode |
| [03-workspace-dark.png](03-workspace-dark.png) | Six leads, pinned reminder, overdue follow-up, all pipeline stages |
| [04-workspace-light.png](04-workspace-light.png) | The same lead overview in light mode |
| [05-add-lead.png](05-add-lead.png) | Create Ava Thompson at Willow Financial, defaulting to New |
| [06-discussion-and-reminder.png](06-discussion-and-reminder.png) | Maya's discussion history and a draft with a 4:30 PM reminder |
| [07-saved-discussion.png](07-saved-discussion.png) | The saved discussion appears first and the active reminder changes |
| [08-status-filter.png](08-status-filter.png) | Ava remains Qualified after reload; filter to qualified leads |
| [09-discussion-search.png](09-discussion-search.png) | Misspelled onboarding query with a highlighted historical discussion |
| [10-search-to-timeline.png](10-search-to-timeline.png) | Open Maya's timeline with Enter from autocomplete |

The overview uses a larger viewport to show the complete pipeline without
changing app styles or cropping the image.
The metadata is in [manifest.json](manifest.json). Initial captures from the same
session remain in `drafts/`; earlier project screenshots remain in the parent folder.
