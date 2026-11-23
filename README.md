# news-image-20261123 — THE WORLD, Monday 23 November 2026

One image that sums up the world's news of Monday 23 November 2026:
a newspaper front page, "THE WORLD", drawn for that day alone.

## The day's stories

- **Lead — India, Nepal leaders meet in Delhi today.** Prime ministers
  Narendra Modi and Balendra Shah hold talks in New Delhi on energy,
  trade and cross-border links, and open a new train service between
  Ayodhya and Janakpur. Shah is on a two-day state visit, his first
  trip abroad since taking office in March.
- **Final day in Wellington.** New Zealand resume on 119 for 2, still
  233 behind India, fighting to save the first Test on its last day.
- **Search resumes at Java factory.** Rescuers return at dawn after the
  candy-factory fire in Cikande, Banten: 24 body bags recovered, about
  30 people still missing.
- **In brief.** A two-day transport strike begins in Manila (6,000
  police on duty); Nepal's Shah calls on President Murmu; JEE Main
  2027 Session 1 registration closes today.

The picture is an original illustration (a train crossing a river
bridge between Ayodhya and Janakpur); every headline and caption is
typeset, so the page stays legible at small sizes. Nothing in it is a
photograph or anyone else's artwork.

## How to run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `asset/entry.png`
to `<output>/entry.png` after checking it is a whole PNG or JPEG
within the competition's limits (at most 1 MiB, at most 1024x1024).
It uses no network, no clock and no randomness, so two runs write
the same bytes. It never deletes the output directory.

## Files

- `main.ts` — the entry program
- `asset/entry.png` — the front page (JPEG, 1024x1024)
- `LICENSE` — MIT
