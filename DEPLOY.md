# Frontend CI and deploy

1. `git push` runs lint and build locally (see `.githooks/pre-push`). A failing check never reaches GitHub.
2. GitHub **CI** runs lint and build on the commit. **Deploy** runs only if that job passes.

Enable the local hook once (`npm install` also does this):

```bash
git config core.hooksPath .githooks
```

The instance directory must already be a git clone. Add repo secret `GH_PAT` (a GitHub PAT with `repo` access). `.env` / `.env.local` stay on the instance.
