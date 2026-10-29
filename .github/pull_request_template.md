## Summary

<!-- What changed and why, in one or two sentences. -->

## Jira ticket

<!-- AT-<number>, for example AT-17. -->

## Test plan

- [ ] `npm test`
- [ ] `npm run check:catalog` (when the metric catalogue changed)
- [ ] Manual check (command and output)

## Checklist

- [ ] Branch follows `AT-<ticket>-<slug>` or `feature/<slug>`.
- [ ] The pull request is focused on one metric, helper, or document.
- [ ] New formulas have a `node:test` case.
- [ ] Docs are updated where behaviour changed.
- [ ] No `.env` files, tokens, or other secrets are committed.
