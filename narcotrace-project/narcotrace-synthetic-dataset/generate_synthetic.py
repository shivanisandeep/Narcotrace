"""Synthetic colorimetric-reaction image generator for NarcoTrace.

Renders a test pouch/well on a surface, optionally with a reference colour card, then
applies realistic capture effects (colour temperature, brightness, shadows, glare,
phone tint, blur, sensor noise, JPEG). Labels are COLOUR classes only.

  python generate_synthetic.py OUT_DIR [images_per_class=1000] [seed=7]
"""
import csv, sys, pathlib, random, time
import numpy as np, cv2

OUT = pathlib.Path(sys.argv[1]); PER = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
SEED = int(sys.argv[3]) if len(sys.argv) > 3 else 7
S = 224
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)

BASE = {  # approximate sRGB centre of each colour class (names follow the app's substanceReactionMap)
    "blue": (30, 90, 200), "purple": (110, 50, 160), "purple_black": (45, 20, 60),
    "orange_brown": (190, 100, 40), "orange_red": (225, 80, 30),
}
CLASSES = list(BASE) + ["no_reaction", "partial", "unreadable"]
SURFACES = [(205, 200, 190), (235, 235, 235), (120, 120, 125), (150, 110, 75), (60, 60, 65), (180, 190, 170)]
PHONES = {  # (r,g,b gain, saturation, gamma)
    "phone_A_neutral": ((1.00, 1.00, 1.00), 1.00, 1.00), "phone_B_warm": ((1.06, 1.00, 0.92), 1.10, 0.95),
    "phone_C_cool": ((0.94, 1.00, 1.07), 0.95, 1.05), "phone_D_vivid": ((1.02, 1.00, 0.98), 1.30, 0.92),
    "phone_E_flat": ((1.00, 1.01, 1.00), 0.78, 1.10),
}


def kelvin_gain(k):  # Tanner Helland approximation, normalised
    t = k / 100.0
    r = 255 if t <= 66 else 329.7 * (t - 60) ** -0.1332
    g = 99.47 * np.log(t) - 161.1 if t <= 66 else 288.1 * (t - 60) ** -0.0755
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5 * np.log(t - 10) - 305.0)
    v = np.clip(np.array([r, g, b], np.float32), 1, 255) / 255.0
    return v / v.max()


def smooth_noise(rng, scale=6):
    a = rng.random((scale, scale)).astype(np.float32)
    n = cv2.resize(a, (S, S), interpolation=cv2.INTER_CUBIC)
    return (n - n.min()) / (np.ptp(n) + 1e-6)


def jitter(rgb, rng):
    hsv = cv2.cvtColor(np.uint8([[rgb]]), cv2.COLOR_RGB2HSV)[0, 0].astype(np.float32)
    hsv[0] = (hsv[0] + rng.normal(0, 3)) % 180
    hsv[1] = np.clip(hsv[1] * rng.uniform(.85, 1.1), 0, 255); hsv[2] = np.clip(hsv[2] * rng.uniform(.85, 1.12), 0, 255)
    return cv2.cvtColor(np.uint8([[hsv]]), cv2.COLOR_HSV2RGB)[0, 0].astype(np.float32)


def make_scene(label, rng, sp):
    bg = np.array(sp["surface"], np.float32)
    img = np.ones((S, S, 3), np.float32) * bg
    img *= (0.93 + 0.14 * smooth_noise(rng, 5))[..., None]                      # surface texture
    cx, cy = S / 2 + rng.uniform(-22, 22), S / 2 + rng.uniform(-22, 22)
    a, b = rng.uniform(55, 80), rng.uniform(40, 80); p = rng.uniform(2, 6)
    d = (np.abs((xx - cx) / a) ** p + np.abs((yy - cy) / b) ** p) ** (1 / p)
    mask = np.clip((1.0 - d) / 0.06, 0, 1)                                      # soft edge
    pale = np.array([238, 232, 214], np.float32) * rng.uniform(.93, 1.04)
    if label in BASE:
        c = jitter(BASE[label], rng); centre = np.clip(1 - d, 0, 1) ** 0.5
        fill = pale * (1 - 0.25 * centre[..., None]) * 0 + c                    # solid hue
        fill = fill * (0.85 + 0.15 * centre[..., None]) * (0.92 + 0.16 * smooth_noise(rng, 4))[..., None]
        fill = fill * (1 - .12 * (d[..., None] ** 3)) + pale * .12 * (d[..., None] ** 3)  # diffuse edge
    elif label == "no_reaction":
        fill = pale * (0.95 + 0.08 * smooth_noise(rng, 4))[..., None] + rng.normal(0, 2, 3)
    elif label == "partial":
        c = jitter(BASE[rng.choice(list(BASE))], rng); n = smooth_noise(rng, rng.integers(4, 8))
        cover = np.clip((n - rng.uniform(.45, .7)) * 6, 0, 1)[..., None] * rng.uniform(.5, .9)
        fill = pale * (1 - cover) + c * cover
    else:  # unreadable: underlying reaction is arbitrary, defect added in capture stage
        c = jitter(BASE[rng.choice(list(BASE))], rng); fill = c * (0.9 + 0.1 * smooth_noise(rng, 4))[..., None]
    img = img * (1 - mask[..., None]) + fill * mask[..., None]
    if rng.random() < .35:                                                      # powder residue specks
        for _ in range(rng.integers(5, 25)):
            r = rng.uniform(1.5, 5); px, py = cx + rng.normal(0, a * .5), cy + rng.normal(0, b * .5)
            m = np.clip(1 - ((xx - px) ** 2 + (yy - py) ** 2) ** .5 / r, 0, 1)[..., None]
            img = img * (1 - m * .7) + 245 * m * .7
    has_card = rng.random() < .8
    if has_card:                                                                # white/grey/colour reference card
        cw, ch = 72, 30; x0 = rng.choice([6, S - cw - 6]); y0 = rng.choice([6, S - ch - 6])
        img[y0:y0 + ch, x0:x0 + cw] = 30
        for i, col in enumerate([(240, 240, 240), (128, 128, 128), (200, 40, 40), (40, 160, 70)]):
            img[y0 + 3:y0 + ch - 3, x0 + 3 + i * 17:x0 + 17 + i * 17 - 1] = col
    return img, has_card


def capture(img, label, rng, sp):
    meta = {}
    img = img * (kelvin_gain(sp["kelvin"]) ** sp["cast_strength"])
    br = sp["brightness"]; meta["unreadable_reason"] = ""
    blur = rng.choice([0, 0, 0.6, 1.2]) if label != "unreadable" else 0
    glare_s = rng.choice([0, 0, 0, 0.4, 0.8]) if label != "unreadable" else 0
    if label == "unreadable":
        kind = rng.choice(["dark", "overexposed", "blur", "occluded"]); meta["unreadable_reason"] = kind
        if kind == "dark": br = rng.uniform(.06, .17)
        elif kind == "overexposed": br = rng.uniform(2.3, 3.2); glare_s = rng.uniform(1.0, 1.6)
        elif kind == "blur": blur = rng.uniform(7, 12)
        else:
            x0, y0 = rng.integers(40, 90, 2); w, h = rng.integers(90, 130, 2)
            img[y0:y0 + h, x0:x0 + w] = np.array([120, 85, 70]) * rng.uniform(.6, 1.0)   # finger-like occluder
    shade = 1 + sp["grad"] * ((xx - S / 2) * sp["gx"] + (yy - S / 2) * sp["gy"]) / (S / 2)
    img = img * np.clip(shade, .3, 1.7)[..., None] * br
    if sp["shadow"] > 0:
        t = (xx * sp["sx"] + yy * sp["sy"]); band = np.clip(1 - np.abs(t - sp["so"]) / 28, 0, 1)
        img *= (1 - sp["shadow"] * cv2.GaussianBlur(band, (0, 0), 8))[..., None]
    if glare_s > 0:
        gx, gy = rng.uniform(60, 165, 2); g = np.exp(-((xx - gx) ** 2 + (yy - gy) ** 2) / (2 * rng.uniform(10, 24) ** 2))
        img += (g * 255 * glare_s)[..., None]
    gain, sat, gamma = PHONES[sp["phone"]]
    img = img * np.array(gain, np.float32)
    gray = img.mean(2, keepdims=True); img = gray + (img - gray) * sat
    img = 255 * (np.clip(img, 0, 255) / 255) ** gamma
    if blur > 0: img = cv2.GaussianBlur(img, (0, 0), blur)
    img += rng.normal(0, sp["noise"], img.shape) * (1 + .6 * (1 - min(br, 1)))
    meta.update(blur=round(float(blur), 2), glare=round(float(glare_s), 2), brightness_applied=round(float(br), 3))
    return np.clip(img, 0, 255).astype(np.uint8), meta


def new_session(rng):
    return dict(surface=SURFACES[rng.integers(len(SURFACES))], phone=rng.choice(list(PHONES)),
                kelvin=int(rng.choice([2700, 3200, 4000, 5000, 5600, 6500, 7500], p=[.1, .12, .1, .1, .2, .28, .1])),
                cast_strength=rng.uniform(.5, 1.0), brightness=rng.choice([.45, .7, 1.0, 1.0, 1.25]) * rng.uniform(.9, 1.1),
                grad=rng.uniform(0, .35), gx=rng.uniform(-1, 1), gy=rng.uniform(-1, 1),
                shadow=rng.choice([0, 0, .25, .5]), sx=rng.uniform(-1, 1), sy=rng.uniform(-1, 1), so=rng.uniform(100, 300),
                noise=rng.uniform(1.5, 6), jpeg=int(rng.integers(62, 95)))


def main():
    rng = np.random.default_rng(SEED); random.seed(SEED); t0 = time.time()
    per_session = 8; n_sessions = PER * len(CLASSES) // per_session
    sess_ids = [f"SYN{i:04d}" for i in range(n_sessions)]; random.shuffle(sess_ids)
    split_of = {s: "train" if i < .7 * n_sessions else "val" if i < .85 * n_sessions else "test" for i, s in enumerate(sess_ids)}
    OUT.mkdir(parents=True, exist_ok=True); rows = []; counts = {c: 0 for c in CLASSES}; total = PER * len(CLASSES)
    for si, sid in enumerate(sess_ids):
        sp = new_session(rng)
        # each session: 8 shots, classes cycled so every class stays balanced across the whole set
        for k in range(per_session):
            lab = CLASSES[(si * per_session + k) % len(CLASSES)]
            if counts[lab] >= PER: lab = min(counts, key=counts.get)
            counts[lab] += 1
            scene, has_card = make_scene(lab, rng, sp); shot_sp = dict(sp, brightness=sp["brightness"] * rng.uniform(.92, 1.08))
            im, meta = capture(scene, lab, rng, shot_sp)
            d = OUT / split_of[sid] / lab; d.mkdir(parents=True, exist_ok=True)
            fn = f"{sid}_{k:02d}.jpg"
            cv2.imwrite(str(d / fn), cv2.cvtColor(im, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, sp["jpeg"]])
            rows.append(dict(file=f"{split_of[sid]}/{lab}/{fn}", label=lab, split=split_of[sid], session=sid, source="synthetic",
                             phone_profile=sp["phone"], light_kelvin=sp["kelvin"], has_reference_card=int(has_card),
                             jpeg_quality=sp["jpeg"], **meta))
        if si % 100 == 0: print(f"session {si}/{n_sessions}  {time.time() - t0:.0f}s", flush=True)
    with open(OUT / "manifest.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    print("done", len(rows), "images in", round(time.time() - t0), "s")


main()
