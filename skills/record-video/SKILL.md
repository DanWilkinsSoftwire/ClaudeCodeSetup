---
name: record-video
description: Record a browser video at localhost:3002 for PR before/after demos. Opens a headed browser, records until closed.
---

Record a video of the app running at localhost:3002 for use in PR reviews.

Usage: `/record-video [label] [route]`

Examples:
- `/record-video before /search` - record the search page, saved as `before_<timestamp>.webm`
- `/record-video after` - record from the root, saved as `after_<timestamp>.webm`
- `/record-video` - defaults to label "recording", route "/"

Run the recording script:

```
node C:/Users/danwil/.claude/skills/record-video/record.js <LABEL> <ROUTE>
```

Where:
- `<LABEL>` is the first argument (default: "recording") - typically "before" or "after"
- `<ROUTE>` is the second argument (default: "/") - the path to navigate to

The script opens a headed Chromium browser at the given URL and records video. The user interacts with the app manually. When they close the browser window, the video is saved to `./recordings/<label>_<timestamp>.webm` in the current working directory.

After recording, tell the user the file path so they can attach it to their PR.
