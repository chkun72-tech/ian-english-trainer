# Ian English Trainer Project Workflow

## Project Goal

Deploy a simple mobile-friendly English learning app so Ian can open it on a phone and use it before sleep.

## Current Stage

Deployment preparation.

## Scope

- Keep the existing Next.js app.
- Verify it can install and build.
- Prepare it for GitHub and Vercel deployment.
- Support mobile browser usage and adding the site to the phone home screen.

## Out of Scope

- New features.
- UI redesign.
- Rewriting the learning content.
- Adding paid services or API integrations.

## Agent Split

- User: approve GitHub/Vercel account actions and final live URL.
- Codex: inspect, minimally fix blockers, verify build, prepare deployment handoff.
- Vercel: host the deployed Next.js app.

## Workflow

1. Verify project files and security ignores.
2. Install dependencies.
3. Run a production build.
4. Push the project to a new GitHub repository.
5. Import the repository into Vercel.
6. Open the Vercel URL on mobile and add it to the home screen.

## Acceptance Criteria

- `npm run build` succeeds.
- No API keys or local secrets are committed.
- Vercel deployment succeeds and provides a public URL.
- The URL opens on a phone.

## Next Step

Create a GitHub repository and deploy it through Vercel.
