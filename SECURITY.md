# Security policy

## Reporting a vulnerability

If you've found a security issue in Onda, **please don't open a public issue**. Instead, report it privately through GitHub's built-in vulnerability reporting flow:

- Go to <https://github.com/degueba/onda/security/advisories/new>
- Or: from the repo's **Security** tab → **Report a vulnerability**

You'll be able to share details with the maintainers in a private thread, and we'll work with you on a fix and a coordinated disclosure timeline.

## What's in scope

Onda is a **library of components installed as source** into the user's project. Once installed, the code is owned by the consumer. The relevant attack surfaces for us are:

- **The `ondajs` CLI** (`packages/cli/`) — anything that lets a malicious registry, a malicious slug, or a crafted manifest write outside the chosen install paths, exfiltrate user-project files, or execute arbitrary code at install time.
- **The shipped component source** (`registry/components/` and `lib/`) — any pattern that could be exploited when the source runs inside a consumer's Remotion composition. Note: components are deterministic, accept only typed props, and render to pixels — the attack surface here is genuinely small.
- **The docs site** (`www/`) — XSS, content-injection, or SSR issues that would affect onda.video visitors.

## What's out of scope

- Dependency vulnerabilities in `node_modules` — please report those upstream to the relevant package maintainers. We track them via Dependabot.
- Issues that require an attacker to already have arbitrary write access to a developer's machine.
- Bugs in user-modified copies of Onda components after they've been installed and edited.

## What we ask of reporters

- Give us a reasonable timeline to fix the issue before publishing details (we aim for 90 days; usually much faster).
- Don't exploit the issue on systems you don't own or have permission to test.
- We don't run a bug-bounty program. We'll credit you in the release notes for the fix unless you prefer otherwise.
