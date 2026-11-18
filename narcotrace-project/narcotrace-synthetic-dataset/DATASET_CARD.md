# NarcoTrace Synthetic Colour-Reaction Dataset v1

**10,000 synthetic images, 224x224 JPEG, 8 classes, 1,250 per class (perfectly balanced).**
Split by capture session (no session appears in two splits): train 7,000 / val 1,500 / test 1,500.

    train|val|test / <class> / SYNxxxx_kk.jpg      +  manifest.csv

Classes: blue, purple, purple_black, orange_brown, orange_red (reaction colours, named as in the
app's substanceReactionMap), no_reaction, partial (patchy/weak reaction), unreadable (too dark,
overexposed/glare, heavily blurred, or occluded -> the app should say "retake").

manifest.csv columns: file, label, split, session, source, phone_profile, light_kelvin,
has_reference_card, jpeg_quality, blur, glare, brightness_applied, unreadable_reason.

## What it is - and is NOT
- It is **computer-generated**, not photographs. Colours are approximate class centres with random
  hue/saturation/brightness jitter; they are NOT measured from real reagents.
- Classes are **colour classes only**. Do not present them as chemically validated substance results.
- Use it to: pretrain / warm up the CNN on lighting, phone-tint, glare, blur and shadow robustness;
  test the whole pipeline (training -> TFLite -> app) before real data arrives; stress-test the
  "unreadable" / "inconclusive" logic.
- Do NOT use it as your test set or quote its accuracy as field accuracy. Models score very high on
  synthetic data. Real accuracy must come from real photos (authorised lab) taken with your kits.
- Recommended recipe: pretrain on this -> fine-tune on public colorimetric images + your own real
  photos -> report results only on a real, held-out test set.
- State clearly in your report that this dataset is synthetic.

Regenerate / enlarge:  python generate_synthetic.py OUT_DIR 2500 11
