# Cloudinary Console ops (credit hygiene)

After deploying the upload cap and delivery size ladder, do these once in the [Cloudinary Console](https://console.cloudinary.com/):

## 1. Check what is burning credits

Open **Reports** (or the Dashboard credit breakdown) and note the split for the last 30 days:

- **Transformations**: new unique derived URLs
- **Bandwidth**: bytes delivered to browsers
- **Storage**: originals + derived assets kept

This tells you whether delivery, upload size, or library growth is the main driver.

## 2. Delete unused assets

Storage drops **immediately** when assets are deleted (unlike bandwidth/transforms, which roll off over ~30 days).

- Remove orphans, test uploads, and unused marketing assets in the Media Library
- Prefer deleting assets that are no longer referenced in Relisted (old drafts, abandoned IDs)

## 3. Disable unused add-ons

Add-ons are billed separately from base credits. Turn off anything you are not using (background removal, AI effects, etc.).

## 4. Set usage alerts

In **Settings → Account / Billing** (or Notifications), set email alerts below **20 credits** on a rolling 30-day window so you can react before overage.

## 5. Confirm the delivery ladder after deploy

Each listing image should settle near **3 derived sizes** (thumb / card / detail), not dozens of ad‑hoc widths or formats.

- Ladder strings: `f_webp,q_auto:eco,w_200|600|1200,c_limit`
- Avoid Console “Optimize by default” for raw originals if it creates surprise transforms without `fl_original`

## 6. Optional follow-ups

- Client-side compress before upload (further cuts storage + upload transforms)
- Eager-generate thumb/card/detail on upload if first-view spikes remain
- One-off Admin API resize for very old multi‑MB originals still in the library
