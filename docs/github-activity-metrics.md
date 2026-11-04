# GitHub activity metrics (demo)

`src/github-activity-metrics.js` turns GitHub events into engineering activity metrics.

| Metric | Source webhook event |
|---|---|
| Total commits | `push` (commits) |
| Pull requests created | `pull_request` (opened) |
| Pull requests reviewed | `pull_request_review` (submitted) |
| Pull requests merged | `pull_request` (closed, merged = true) |
| Contributors and activity | the actor of each event above |

Map each event to `{ type, actor }` and call `summarizeActivity(events)`. Run the tests with
`node --test src/github-activity-metrics.test.js`.
