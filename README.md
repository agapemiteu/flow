# FlowReplay

**Every banking failure becomes a test the next release must pass.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fagapemiteu%2Fflowreplay)

FlowReplay is a hackathon-grade, real Next.js application that demonstrates a banking reliability loop:

1. Capture a sanitised customer failure trace.
2. Group matching failures into one journey.
3. Compile the journey into an executable scenario.
4. Replay the scenario against a release candidate.
5. Generate a candidate patch.
6. Require human approval.
7. Rerun the original journey to verify the fix.

## What is real in this prototype

- Next.js App Router application.
- Server-side Route Handlers for replay execution and patch approval.
- Deterministic release replay simulation.
- Working failed-to-passed state transition.
- Generated scenario YAML.
- Candidate code diff.
- Human approval gate.
- Responsive product UI using Hugeicons.
- No PIN, OTP, full account number, or real customer record is used.

## Stack

- Next.js 16
- React 19
- TypeScript
- Hugeicons
- CSS Modules

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

## Demo path

1. Open the workspace.
2. Run `FR-2041` against release `2.5.0-rc.3`.
3. See the release fail because status enquiry does not start after network restoration.
4. Generate a candidate fix.
5. Review and approve the sandbox-only patch.
6. Watch the original customer journey rerun and pass.

## API routes

### `POST /api/replay`

```json
{
  "release": "2.5.0-rc.3",
  "journeyId": "FR-2041",
  "patched": false
}
```

### `POST /api/patch`

```json
{
  "action": "generate",
  "journeyId": "FR-2041"
}
```

Use `action: "approve"` to approve the patch for the sandbox.

## Deployment

The application has no required environment variables. Use the **Deploy with Vercel** button above, import the repository, and keep the default Next.js settings.

Every push to `main` is checked by GitHub Actions before the next deployment.
