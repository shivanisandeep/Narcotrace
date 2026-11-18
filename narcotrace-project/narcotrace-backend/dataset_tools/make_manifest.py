"""Build a labelled manifest from a folder layout:
   raw/<kit>/<expected_color_class>/<imagefile>.jpg
Metadata (lighting, phone, kit lot...) goes in raw/metadata.csv keyed by filename.
Splits by SESSION (not by image) so near-duplicate photos never leak across train/test."""
import csv, pathlib, random, sys

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "raw")
rows = []
for p in root.rglob("*.jpg"):
    kit, label = p.parts[-3], p.parts[-2]
    session = p.stem.split("_")[0]          # name files like S012_0001.jpg  (S012 = one test session)
    rows.append({"file": str(p), "kit": kit, "label": label, "session": session})
sessions = sorted({r["session"] for r in rows}); random.Random(42).shuffle(sessions)
n = len(sessions); split = {s: ("train" if i < .7 * n else "val" if i < .85 * n else "test") for i, s in enumerate(sessions)}
for r in rows: r["split"] = split[r["session"]]
with open("manifest.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["file", "kit", "label", "session", "split"]); w.writeheader(); w.writerows(rows)
print(len(rows), "images,", n, "sessions ->", "manifest.csv")
