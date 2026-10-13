# LeadFlow walkthrough

[Watch or download the MP4](leadflow-demo.mp4).

A 1 minute 40 second silent, captioned recording at 1920 × 1080, 16:9.
The H.264 MP4 is approximately 4 MB.
Recorded on 14 October 2026 with an isolated demo dataset. Lead creation,
status changes, discussions, and reminders use the real FastAPI API and PostgreSQL.
The recorded reload shows that these changes persist.

The search segment is explicitly labeled as a UI demonstration using fixed API
responses. Solr was unavailable from the recording session; this segment does not
verify search indexing or fuzzy matching. Separate real-service integration tests
are documented in [the backend guide](../backend.md#tests).

## Chapters

| Start | Flow |
| --- | --- |
| 0:00 | LeadFlow: Leads, conversations, and follow-ups in one workspace |
| 0:05 | Demo sign-in: A browser-tab session, with no password |
| 0:11 | Pipeline overview: Latest notes, statuses, and activity times |
| 0:14 | Follow-ups: Today's reminders are pinned; overdue reminders are red |
| 0:22 | Create a lead: Name required; company and phone are optional |
| 0:32 | New leads start at New: Open the lead to build its history |
| 0:37 | Update status: Qualify the lead directly from its dialog |
| 0:40 | Log a discussion: Keep the conversation and next action together |
| 0:46 | Schedule follow-up: Save the discussion with a 4:30 PM reminder |
| 0:50 | Saved immediately: The note appears first and the reminder updates |
| 0:56 | Today's priorities: The new follow-up is pinned in the lead list |
| 1:00 | Reload: The discussion, reminder, and status persist in PostgreSQL |
| 1:06 | Filter the pipeline: Focus on qualified leads |
| 1:10 | Search UI demo: Fixed demo responses; this segment does not verify Solr |
| 1:16 | Search UI demo: Find a historical discussion despite a typo |
| 1:21 | Discussion timeline: All conversations appear newest first |
| 1:27 | Light mode: A smooth theme change across the entire workspace |
| 1:36 | LeadFlow: Built for the follow-through |

Captions are burned into the MP4. Editable caption files are included as
[WebVTT](leadflow-demo.vtt) and [ASS](leadflow-demo.ass); timing metadata is in
[chapters.json](chapters.json). The video has no narration or music.
