# CTRL? LAB EP001 — Reference analysis

Reference: <https://youtu.be/Ll45R_Z8tQc?si=TxFffDMqCqrZOFHX> (video ID `Ll45R_Z8tQc`)
Analysis date: 2026-10-16
Status: **NOT ANALYSED — reference unreachable from this production environment**

## 1. Access attempts (all failed)

| Route | Result |
|---|---|
| `curl https://www.youtube.com/watch?v=Ll45R_Z8tQc` | Proxy refused the tunnel: `CONNECT 403` (organisation egress policy) |
| `youtube-nocookie.com/embed/…`, `i.ytimg.com` (thumbnails) | `CONNECT 403` |
| oEmbed via `noembed.com` | `CONNECT 403`; the page-reader tool cannot resolve the host either (`ENOTFOUND`) |
| Invidious API (`inv.nadeko.net/api/v1/videos/…`) | `CONNECT 403` |
| Page-reader tool on `www.youtube.com/watch?v=…` | `getaddrinfo ENOTFOUND www.youtube.com` |
| Web-index search for the ID, the full URL, and "W&W" channel + AI explainer | No result identifies this video (title, creator, subject or transcript) |

The policy denial was not routed around. No VPN, mirror scraping or third-party download service was used.

## 2. What is known

| Category | Content |
|---|---|
| Directly observed in the video | **Nothing.** No frame, caption or audio was accessed. |
| Supported only by a transcript | **Nothing.** No transcript was accessible. |
| Supported by the brief alone | The brief calls it an educational reference and implies the creator is "W&W". It also says an earlier "seven AI tricks" outline is **provisional and not a verified summary**. |
| Unknown | Actual subject, teaching points, demonstrations, claimed outcomes, hook structure, visual style, runtime, and which tools/features it covers. |

## 3. Consequences for production

- The episode's **subject is not locked**. The script, demonstrations, chapter structure and factual claims cannot be written honestly until it is.
- The "seven AI tricks" outline is **not** used as a substitute topic.
- Work that does not depend on the subject continues: the EffectCraft pipeline, the PATCH character rig, the visual system, the narration pipeline, the timing/manifest tooling and a clearly labelled technical prototype.

## 4. Input needed to unblock (any one of these)

1. The video's **title and channel**, plus its **transcript** or captions (YouTube ▸ ··· ▸ Show transcript ▸ copy and paste), saved as `reference/transcript.txt`.
2. A local copy of the video you have the right to use for analysis, placed in `reference/`. Frames would then be inspected for structure only, never reused.
3. Allow `www.youtube.com`, `i.ytimg.com` and `*.googlevideo.com` under the cloud environment's **Network access ▸ Allowed domains**, then start a new session.

## 5. Template for the completed analysis (to fill once access exists)

- Actual subject:
- Main teaching points:
- Demonstrations and claimed outcomes:
- Hook and explanation structure:
- Visual principles worth learning from:
- Claims that require fresh verification (with official source + date):
- Our original interpretation (CTRL? LAB voice, PATCH, recurring example):
