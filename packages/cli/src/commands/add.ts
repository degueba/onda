// `onda add` — install one or more components by slug.
//
// M1 placeholder. The real implementation lands in M2 (happy path, single
// component, no deps) and M3/M4 (transitive deps + import rewriting). Kept
// as its own module so the entry's dispatch table doesn't move when the
// body fills in.

export async function runAdd(_args: string[]): Promise<void> {
  console.error(
    'onda add: not implemented yet — coming in techspec 006 M2.\n' +
      'See https://github.com/degueba/onda/blob/main/docs/techspecs/006-cli/roadmap.md',
  );
  process.exit(2);
}
