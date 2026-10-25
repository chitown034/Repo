#!/usr/bin/env python3
"""Health Auto Export (Google Drive) -> Command Deck `appleHealth` document.

Steven's iPhone already runs Health Auto Export once a day and drops `HealthAutoExport-YYYY-MM-DD.json`
into a Google Drive folder. The Mac daemon that used to turn those exports into the deck's twelve Health
tiles died on 2026-09-13. This script is the replacement sync: it reads the export files (hourly
aggregates per metric, one sleep row per night, optional workouts), merges them into the existing
`appleHealth` document without losing anything the daemon wrote, and prints the `{v: ...}` body for an
ArtifactData `set`.

    python3 scripts/health-drive-sync.py --exports <dir of HealthAutoExport-*.json> \
        --existing <appleHealth.json as ArtifactData saved it> --out <doc.json> [--now ISO] [--received ISO]

Rules kept from integrations/apple-health-dashboard.md: metric keys are the deck's own (`step_count` ...),
never invented; `daily` days, `sleep` nights (by night) and `workouts` (by id) already in the doc survive;
`records` is carried forward; `sources` is appended to; `dailyDays` is recomputed from the merged daily;
timestamps keep the daemon's `YYYY-MM-DD HH:MM:SS` form (UTC for latest_at / start, local for start_local
and the daily day keys); only `syncedAt` is ISO-with-Z. A day with no sample is a gap, never a zero.
Health data stays in this doc: nothing here is written anywhere else.
"""
from __future__ import annotations

import argparse
import glob
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

# Health Auto Export metric names that the deck's AH_LABELS table knows. Anything else is skipped (never invented).
KNOWN = {
    "step_count", "active_energy", "basal_energy_burned", "apple_exercise_time", "apple_stand_time", "apple_stand_hour",
    "flights_climbed", "walking_running_distance", "cycling_distance", "weight_body_mass", "body_fat_percentage",
    "lean_body_mass", "body_mass_index", "waist_circumference", "height", "environmental_audio_exposure",
    "headphone_audio_exposure", "heart_rate", "resting_heart_rate", "heart_rate_variability", "walking_heart_rate_average",
    "vo2_max", "blood_pressure", "heart_rate_recovery_one_minute", "mindful_minutes", "walking_speed", "walking_step_length",
    "walking_asymmetry_percentage", "walking_double_support_percentage", "stair_speed_up", "stair_speed_down",
    "six_minute_walking_test_distance", "apple_walking_steadiness", "dietary_energy", "dietary_water", "protein",
    "carbohydrates", "total_fat", "dietary_sugar", "dietary_caffeine", "sexual_activity", "respiratory_rate",
    "blood_oxygen_saturation", "apple_sleeping_wrist_temperature", "blood_glucose", "body_temperature", "time_in_daylight",
    "handwashing", "toothbrushing", "number_of_times_fallen", "uv_exposure", "physical_effort", "cardio_recovery",
}
# Day totals are sums for these (the tile shows the day's total); everything else is a point value (the tile shows the latest/avg).
CUMULATIVE = {
    "step_count", "active_energy", "basal_energy_burned", "apple_exercise_time", "apple_stand_time", "apple_stand_hour",
    "flights_climbed", "walking_running_distance", "cycling_distance", "mindful_minutes", "dietary_energy", "dietary_water",
    "protein", "carbohydrates", "total_fat", "dietary_sugar", "dietary_caffeine", "time_in_daylight", "handwashing",
    "toothbrushing", "number_of_times_fallen",
}
FMT = "%Y-%m-%d %H:%M:%S"


def parse_hae_date(s: str) -> datetime | None:
    """'2026-10-22 06:00:00 -0700' -> aware datetime. Returns None for anything else."""
    m = re.match(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) ([+-])(\d{2})(\d{2})$", str(s or "").strip())
    if not m:
        return None
    naive = datetime.strptime(m.group(1), FMT)
    sign = 1 if m.group(2) == "+" else -1
    off = timezone(sign * timedelta(hours=int(m.group(3)), minutes=int(m.group(4))))
    return naive.replace(tzinfo=off)


def utc_str(d: datetime) -> str:
    return d.astimezone(timezone.utc).strftime(FMT)


def local_str(d: datetime) -> str:
    return d.strftime(FMT)


def parse_doc_ts(s) -> datetime | None:
    """The doc's own 'YYYY-MM-DD HH:MM:SS[.ffffff]' (UTC) or ISO strings -> aware UTC datetime; None when unreadable."""
    if not s:
        return None
    s = str(s).strip()
    for fmt in (FMT, FMT + ".%f", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    try:
        d = datetime.fromisoformat(s.replace("Z", "+00:00"))
        return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def num(x):
    try:
        if x is None or isinstance(x, bool):
            return None
        v = float(x)
        return v if v == v else None
    except (TypeError, ValueError):
        return None


def read_exports(paths: list[str]):
    """Every sample from every file: {metric: [(dt, value, source)]}, sleep rows, workouts, units, and per-file problems."""
    samples: dict[str, list] = {}
    units: dict[str, str] = {}
    sleep: dict[str, dict] = {}
    workouts: dict[str, dict] = {}
    problems: list[str] = []
    for p in sorted(paths):
        try:
            with open(p, encoding="utf-8") as f:
                doc = json.load(f)
        except (OSError, ValueError) as e:
            problems.append(f"{os.path.basename(p)}: unreadable ({e.__class__.__name__})")
            continue
        data = doc.get("data") if isinstance(doc, dict) else None
        if not isinstance(data, dict):
            problems.append(f"{os.path.basename(p)}: no data object")
            continue
        for m in data.get("metrics") or []:
            if not isinstance(m, dict):
                continue
            name = str(m.get("name") or "")
            rows = m.get("data") or []
            if name == "sleep_analysis":
                for r in rows:
                    if not isinstance(r, dict):
                        continue
                    start = parse_hae_date(r.get("sleepStart") or r.get("inBedStart") or r.get("date"))
                    if not start:
                        continue
                    night = (start - timedelta(hours=12)).strftime("%Y-%m-%d")
                    hrs = lambda k: num(r.get(k))
                    row = {"night": night,
                           "in_bed_min": (hrs("inBed") or 0) * 60, "asleep_min": (hrs("totalSleep") if hrs("totalSleep") is not None else hrs("asleep") or 0) * 60,
                           "core_min": (hrs("core") or 0) * 60, "deep_min": (hrs("deep") or 0) * 60, "rem_min": (hrs("rem") or 0) * 60,
                           "awake_min": (hrs("awake") or 0) * 60}
                    if row["in_bed_min"] > 0 or row["asleep_min"] > 0 or row["core_min"] + row["deep_min"] + row["rem_min"] > 0:
                        sleep[night] = {k: (round(v, 2) if isinstance(v, float) else v) for k, v in row.items()}
                continue
            if name not in KNOWN:
                continue
            if m.get("units"):
                units[name] = str(m["units"]).replace("\\/", "/")
            for r in rows:
                if not isinstance(r, dict):
                    continue
                dt = parse_hae_date(r.get("date"))
                if not dt:
                    continue
                v = num(r.get("qty"))
                if v is None:
                    v = num(r.get("Avg"))
                if v is None:
                    continue
                samples.setdefault(name, []).append((dt, v, str(r.get("source") or "Health Auto Export")))
        for w in data.get("workouts") or []:
            if not isinstance(w, dict):
                continue
            start = parse_hae_date(w.get("start"))
            end = parse_hae_date(w.get("end"))
            if not start:
                continue
            wtype = str(w.get("name") or w.get("type") or "Workout")
            wid = str(w.get("id") or hashlib.sha1(f"{wtype}|{utc_str(start)}".encode()).hexdigest()[:32].upper())
            minutes = num((w.get("duration") or {}).get("qty")) if isinstance(w.get("duration"), dict) else num(w.get("duration"))
            if minutes is None and end:
                minutes = (end - start).total_seconds() / 60
            kcal = num((w.get("activeEnergy") or {}).get("qty")) if isinstance(w.get("activeEnergy"), dict) else num(w.get("activeEnergy"))
            dist = w.get("distance") if isinstance(w.get("distance"), dict) else None
            km = None
            if dist and num(dist.get("qty")) is not None:
                u = str(dist.get("units") or "").lower()
                km = num(dist["qty"]) * (1.609344 if u.startswith("mi") else 0.001 if u == "m" else 1.0)
            hr = w.get("heartRate") if isinstance(w.get("heartRate"), dict) else {}
            workouts[wid] = {"id": wid, "type": wtype, "start": utc_str(start), "start_local": local_str(start),
                             "minutes": minutes, "kcal": kcal, "km": km,
                             "avg_hr": num(hr.get("avg")) if hr else num(w.get("avgHeartRate")),
                             "max_hr": num(hr.get("max")) if hr else num(w.get("maxHeartRate")),
                             "source": str(w.get("source") or "Health Auto Export")}
    return samples, units, sleep, workouts, problems


def build(samples, units, now_utc: datetime):
    """metrics / daily / sources in the deck's shape, from the raw samples."""
    metrics, daily, sources = {}, {}, []
    newest_all = max((dt for rows in samples.values() for dt, _, _ in rows), default=None)
    for name, rows in samples.items():
        rows.sort(key=lambda t: t[0])
        latest_dt, latest_v, _ = rows[-1]
        earliest_dt = rows[0][0]
        # day buckets in the phone's local day (the sample's own offset), as the daemon did in America/Los_Angeles
        days: dict[str, dict] = {}
        for dt, v, _ in rows:
            d = days.setdefault(dt.strftime("%Y-%m-%d"), {"sum": 0.0, "min": v, "max": v, "last": v, "n": 0, "_last_dt": dt})
            d["sum"] += v; d["min"] = min(d["min"], v); d["max"] = max(d["max"], v); d["n"] += 1
            if dt >= d["_last_dt"]:
                d["last"] = v; d["_last_dt"] = dt
        for k, d in days.items():
            d["avg"] = d["sum"] / d["n"] if d["n"] else None
            d.pop("_last_dt", None)
        daily[name] = days
        # the 7-day windows are filled in by window_stats() from the MERGED daily history, so a run that only holds today's
        # file still sees the week before it (validator P06-F1); samples is recomputed there too (P08-F1)
        metrics[name] = {"metric": name, "unit": units.get(name, ""), "latest": latest_v, "latest_at": utc_str(latest_dt),
                         "earliest": earliest_dt.strftime("%Y-%m-%d"), "avg7": None, "min7": None, "max7": None, "sum7": None,
                         "n7": 0, "days7": 0, "pavg7": None, "psum7": None, "pdays7": None, "samples": len(rows)}
        by_src: dict[str, list] = {}
        for dt, _, src in rows:
            by_src.setdefault(src, []).append(dt)
        for src, dts in by_src.items():
            sources.append({"metric": name, "source": src, "n": len(dts), "first_at": utc_str(min(dts)), "last_at": utc_str(max(dts)), "_dts": dts})
    return metrics, daily, sources


def window_stats(name: str, days: dict, ref_day: str) -> dict:
    """7-day and prior-7-day figures from a metric's merged day buckets, the window ending at ref_day (the newest day in the
    merged doc). Cumulative metrics average per day; point metrics average per sample. Empty prior window -> nulls."""
    ref = datetime.strptime(ref_day, "%Y-%m-%d")
    cum = name in CUMULATIVE
    def agg(lo, hi):
        rows = [(k, d) for k, d in days.items() if isinstance(d, dict) and lo < datetime.strptime(k, "%Y-%m-%d") <= hi]
        rows = [(k, d) for k, d in rows if num(d.get("sum")) is not None and int(d.get("n") or 0) > 0]
        if not rows:
            return None, None, None, None, 0, 0
        s = sum(num(d["sum"]) for _, d in rows); n = sum(int(d["n"]) for _, d in rows)
        mins = [num(d.get("min")) for _, d in rows if num(d.get("min")) is not None]
        maxs = [num(d.get("max")) for _, d in rows if num(d.get("max")) is not None]
        avg = (s / len(rows)) if cum else (s / n)
        return avg, (min(mins) if mins else None), (max(maxs) if maxs else None), s, n, len(rows)
    avg7, min7, max7, sum7, n7, days7 = agg(ref - timedelta(days=7), ref)
    pavg7, _, _, psum7, _, pdays7 = agg(ref - timedelta(days=14), ref - timedelta(days=7))
    return {"avg7": avg7, "min7": min7, "max7": max7, "sum7": sum7, "n7": n7, "days7": days7,
            "pavg7": pavg7 if pdays7 else None, "psum7": psum7 if pdays7 else None, "pdays7": pdays7 if pdays7 else None,
            "samples": sum(int(d.get("n") or 0) for d in days.values() if isinstance(d, dict))}


def merge(existing: dict, fresh_metrics, fresh_daily, fresh_sources, fresh_sleep, fresh_workouts, now_utc, received_utc, ingests_added: list[str]):
    """The daemon's history survives: days, nights, workouts, metric keys and sources it wrote stay unless the export is newer."""
    v = dict(existing or {})
    metrics = dict(v.get("metrics") or {})
    daily = {k: dict(d) for k, d in (v.get("daily") or {}).items() if isinstance(d, dict)}
    for k, days in fresh_daily.items():
        daily.setdefault(k, {}).update(days)          # a day is replaced whole, so feeding the same file twice changes nothing
    all_days = sorted({d for dd in daily.values() for d in dd})
    ref_day = all_days[-1] if all_days else now_utc.strftime("%Y-%m-%d")
    for k, m in fresh_metrics.items():
        old = metrics.get(k)
        old_at = parse_doc_ts(old.get("latest_at")) if old else None
        if not old or (parse_doc_ts(m["latest_at"]) or datetime.min.replace(tzinfo=timezone.utc)) >= (old_at or datetime.min.replace(tzinfo=timezone.utc)):
            keep_earliest = old.get("earliest") if old and old.get("earliest") and str(old["earliest"]) < m["earliest"] else m["earliest"]
            m = dict(m, earliest=keep_earliest)
            metrics[k] = m
    # the week figures are recomputed for EVERY metric from the merged history, so a metric sampled less than daily (weight,
    # VO2 max) never keeps a stale window from an older run (validator pass 2 residual)
    for k, m in metrics.items():
        if isinstance(m, dict) and isinstance(daily.get(k), dict) and daily[k]:
            metrics[k] = dict(m, **window_stats(k, daily[k], ref_day))
    sleep = {str(r.get("night")): r for r in (v.get("sleep") or []) if isinstance(r, dict) and r.get("night")}
    sleep.update(fresh_sleep)
    workouts = {str(r.get("id")): r for r in (v.get("workouts") or []) if isinstance(r, dict) and r.get("id")}
    workouts.update(fresh_workouts)
    sources = {(s.get("metric"), s.get("source")): s for s in (v.get("sources") or []) if isinstance(s, dict)}
    meta = dict(v.get("meta") or {})
    # per-source per-day sample counts live in meta.sourceDays and are replaced per day, like daily: a re-fed or rewritten
    # file gives the same count as one combined run (validator P08-F1 / pass-2 P2-08-F1)
    source_days = {k: dict(d) for k, d in (meta.get("sourceDays") or {}).items() if isinstance(d, dict)}
    for s in fresh_sources:
        key = (s["metric"], s["source"]); sk = s["metric"] + "|" + s["source"]
        dts = s.pop("_dts", [])
        per_day: dict[str, int] = {}
        for dt in dts:
            per_day[dt.strftime("%Y-%m-%d")] = per_day.get(dt.strftime("%Y-%m-%d"), 0) + 1
        old = sources.get(key)
        sd = source_days.setdefault(sk, {})
        if old and not sd:
            sd["_before"] = int(old.get("n") or 0)      # the daemon's count, from before per-day counts were kept ...
            sd["_before_until"] = str(old.get("last_at") or "")[:10]   # ... which already covers every day up to this one
        sd.update(per_day)
        until = str(sd.get("_before_until") or "")
        # a backfilled day the daemon had already counted is not counted twice (validator pass 3, P3-08-F1)
        n = int(sd.get("_before") or 0) + sum(int(c) for d, c in sd.items() if not d.startswith("_") and d > until)
        if old:
            s = {"metric": s["metric"], "source": s["source"], "n": n,
                 "first_at": min(str(old.get("first_at") or s["first_at"]), s["first_at"]), "last_at": max(str(old.get("last_at") or ""), s["last_at"])}
        else:
            s = dict(s, n=n)
        sources[key] = s
    meta["sourceDays"] = source_days
    meta["last_received"] = received_utc.strftime(FMT + ".%f")
    seen_files = [str(x) for x in (meta.get("files") or []) if isinstance(x, str)]
    new_files = [f for f in ingests_added if f not in seen_files]
    meta["ingests"] = int(meta.get("ingests") or 0) + len(new_files)   # a file name counts once, however often it is re-fed
    meta["files"] = (seen_files + new_files)[-90:]
    meta["db_now"] = now_utc.strftime(FMT + ".%f") + "+00"
    out = dict(v)
    out.update({"metrics": metrics, "daily": daily, "dailyDays": len({d for days in daily.values() for d in days}),
                "sleep": sorted(sleep.values(), key=lambda r: str(r["night"])),
                "workouts": sorted(workouts.values(), key=lambda r: str(r.get("start") or "")),
                "records": v.get("records") if isinstance(v.get("records"), dict) else {},
                "sources": sorted(sources.values(), key=lambda s: (str(s["metric"]), str(s["source"]))),
                "meta": meta, "syncedAt": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"), "via": "drive-sync", "read": "drive"})
    return out


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--exports", required=True, help="directory holding HealthAutoExport-*.json (or one file)")
    ap.add_argument("--existing", help="the current appleHealth document as ArtifactData saved it (optional)")
    ap.add_argument("--out", required=True, help="where to write the {v: ...} body for ArtifactData set")
    ap.add_argument("--now", help="ISO UTC time to stamp (default: the clock)")
    ap.add_argument("--received", help="ISO UTC time the newest export landed in Drive (default: newest sample)")
    ap.add_argument("--allow-empty-existing", action="store_true", help="start a fresh document when --existing is missing (never in the daily routine)")
    a = ap.parse_args(argv)
    if not a.existing and not a.allow_empty_existing:
        print("pass --existing <current appleHealth.json> (or --allow-empty-existing to start a fresh document)", file=sys.stderr)
        return 4
    paths = [a.exports] if os.path.isfile(a.exports) else sorted(glob.glob(os.path.join(a.exports, "HealthAutoExport-*.json")))
    if not paths:
        print("no HealthAutoExport-*.json files found", file=sys.stderr)
        return 2
    samples, units, sleep, workouts, problems = read_exports(paths)
    for p in problems:
        print("skipped:", p, file=sys.stderr)
    if not samples and not sleep and not workouts:
        print("the exports hold no usable sample: nothing written", file=sys.stderr)
        return 3
    now_utc = parse_doc_ts(a.now) if a.now else datetime.now(timezone.utc)
    newest = max([dt for rows in samples.values() for dt, _, _ in rows] or [now_utc])
    received = parse_doc_ts(a.received) if a.received else newest.astimezone(timezone.utc)
    existing = {}
    if a.existing:
        try:
            with open(a.existing, encoding="utf-8") as f:
                raw = json.load(f)
            inner = raw.get("data", raw) if isinstance(raw, dict) else None
            existing = inner.get("v", inner) if isinstance(inner, dict) else None
        except (OSError, ValueError):
            existing = None
        if not isinstance(existing, dict) or not isinstance(existing.get("metrics"), dict):
            if not a.allow_empty_existing:
                # an ArtifactData set replaces the whole document: without the current one, the daemon's history would be lost
                print(f"--existing {a.existing} is missing or not an appleHealth document: refusing to build a document that would drop the history (pass --allow-empty-existing to start fresh)", file=sys.stderr)
                return 4
            existing = {}
    fresh_metrics, fresh_daily, fresh_sources = build(samples, units, now_utc)
    out = merge(existing, fresh_metrics, fresh_daily, fresh_sources, sleep, workouts, now_utc, received, [os.path.basename(p) for p in paths])
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump({"v": out}, f)
    days = sorted({d for dd in out["daily"].values() for d in dd})
    print(f"metrics {len(out['metrics'])} · daily days {out['dailyDays']} ({days[0] if days else '-'} → {days[-1] if days else '-'}) · "
          f"nights {len(out['sleep'])} · workouts {len(out['workouts'])} · newest sample {utc_str(newest)} UTC · files {len(paths)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
