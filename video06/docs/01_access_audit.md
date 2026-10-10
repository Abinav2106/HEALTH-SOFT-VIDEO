# Video 06 — Access audit

Audit date: 2026-10-10. Environment: cloud session container (Linux, 4 vCPU, 15 GB RAM, ~30 GB free disk).

## Summary

| Capability the brief needs | Status | Evidence |
|---|---|---|
| Search the selected stock library | **Blocked** | No library has been named. Every stock host tested is denied by the organisation egress proxy (`CONNECT … 403 Forbidden`); the page-reader tool cannot resolve them either (`getaddrinfo ENOTFOUND`). |
| Authorised API / download workflow | **Blocked** | No stock API credentials in the environment, and the API hosts are denied (table below). |
| Save and inspect actual video files | **Tooling ready, nothing to inspect** | ffmpeg/ffprobe 6.1.1 (libx264, libx265, ProRes, AAC), ImageMagick, Python numpy + Pillow. No footage has been retrieved. |
| Run the existing Healthsoft rendering project | **Not found** | `Abinav2106/HEALTH-SOFT-VIDEO` is empty on GitHub (no branches, no commits; API returns `409 Git Repository is empty`). None of the other repositories on the account is a Healthsoft project. |
| Rebuild a frame-driven pipeline if needed | Possible | Node 22, npm registry reachable (Remotion 4.0.534 resolvable), Chromium at `/opt/pw-browsers`. |
| Adobe After Effects / Premiere via connected plugin | Not connected | Host status: AE, Premiere, Blender all disconnected. |
| Web-index search (read-only) | Available, limited | Returns result titles, URLs and a short machine-written summary. It cannot open pages, show previews, display AI/provenance labels or licence terms, or download files. |
| Approved voice-over / music / SFX | **Pending** | None supplied. |

## Hosts tested (container egress)

All returned `000` from curl because the proxy refused the tunnel with **403 Forbidden** (organisation policy, not a transient error; not retried or routed around):

```
api.pexels.com        www.pexels.com        videos.pexels.com
pixabay.com           www.storyblocks.com   api.storyblocks.com
www.shutterstock.com  api.shutterstock.com  stock.adobe.com
www.gettyimages.com   artgrid.io            elements.envato.com
mixkit.co             coverr.co             www.videvo.net
www.pond5.com         player.vimeo.com
```

Controls: `github.com` and `registry.npmjs.org` were reachable.

## What this means for the brief

- Every stock item listed in `../sourcing/` is an **unverified lead** found through a web-index search. None has been opened, previewed, downloaded or provenance-checked. None should be described as "verified live action" yet.
- No clip previews or extracted frames can be produced from this session until a library is reachable. The approval gate ("show actual clip previews or extracted frames") cannot be met yet. The lead list gives source-page links so the previews can be checked on the library's own site.
- No footage, composition or render exists, so none is claimed.

## To unblock (owner actions)

1. **Name the stock library and licence tier** (for example Getty/iStock, Shutterstock, Adobe Stock, Storyblocks, Artgrid or Pexels), and confirm the purchase/approval route. Nothing will be bought without approval.
2. **Network access:** in the cloud environment settings (environment menu in the session title bar → Edit → Network access), allow that library's site, API and media-delivery domains under *Allowed domains*, keeping *Allow package managers* ticked. Steps: <https://code.claude.com/docs/en/cloud-environments#network-access>.
3. **Credentials:** add the library's API key in the same settings under *Network secrets* (or as an environment variable, e.g. `STOCK_API_KEY`). Never paste it into chat or commit it. A new session picks it up.
4. **Earlier Healthsoft project:** point to its repository/branch or archive so Video 06 can be added as a separate composition. Otherwise approve rebuilding a fresh frame-driven (Remotion) project here.
5. **Storage for licensed originals:** this repository is **public**. Licensed stock originals must not be committed to it. Use a private repository, or keep media in private storage outside git and track only the edit metadata here.
6. Supply the brand/source assets listed in `02_input_audit.md` §3 and the approved audio (§5).
