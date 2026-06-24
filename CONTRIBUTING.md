# Contributing

## Dependency Automation

Open Stellar uses Dependabot and Renovate to keep npm and GitHub Actions dependencies current without mixing unrelated upgrade risk into feature work.

- Dependabot opens weekly npm and GitHub Actions PRs on Monday UTC.
- Renovate groups common package families such as Stellar, Radix UI, and wallet connector packages.
- Patch dependency PRs may be queued for auto-merge after required checks pass.
- Minor updates remain reviewable and should include a changelog scan for breaking behavior.
- Major updates always require manual review.

## Security Alerts

Dependabot security alerts should stay enabled in the repository settings. Critical CVEs should be handled immediately instead of waiting for the weekly dependency window.

## snarkjs Pinning

`snarkjs` is intentionally pinned at the current 0.7.x line and is ignored by automated dependency updaters.

Upgrading `snarkjs` can change proof generation or verification behavior and may require regenerating ZK artifacts under `public/zk/`. Treat any `snarkjs` upgrade as a manual migration:

1. Regenerate the affected WASM, zkey, proof, public input, and verification key artifacts.
2. Run the passport authorization and status tests.
3. Verify browser-side proof generation against the deployed Soroban verifier.
4. Document the artifact regeneration command and verifier compatibility in the PR.
