# SMA domain launch — instructions for David

Updated 30 October 2026. Vercel ownership verification succeeded for both `strategicmarketingadvisors.com` and `www.strategicmarketingadvisors.com`. The real-domain website DNS switch is still pending at David's HostGator VPS.

The launch configuration now uses `https://strategicmarketingadvisors.com` for canonicals, schema, sitemap, robots, llms.txt, the public CMS origin and dashboard recovery. Exact apex/www API origins are allowed, and the existing Vercel origin remains supported during migration. Supabase's two exact SMA callbacks (`/admin` and `/admin?mode=reset`) were saved without changing the unrelated application's default Site URL or existing callback entries.

## Where to edit

The delegated nameservers are `ns1.smahosting.com` and `ns2.smahosting.com`. David has confirmed the active DNS zone is on his HostGator VPS; the zone editor identifies its own nameservers as `ns1.50-6-5-34.www.hostgator.com` and `ns2.50-6-5-34.www.hostgator.com`. Edit that HostGator zone, not the inactive IONOS DNS table. The domain registrar or a separate hosting account does not necessarily manage the active DNS zone.

Keep these nameservers. Preserve Google Workspace MX, SPF, DKIM, DMARC, and all other existing TXT records. Preserve the `atlas` subdomain and other unrelated subdomains. No registrar transfer or domain purchase is needed.

## Step 1 — prove ownership before changing website traffic

Add both records at the existing DNS host. If its editor requires full names, use `_vercel.strategicmarketingadvisors.com`; otherwise use `_vercel`. Keep them as separate TXT values at the same name.

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| TXT | `_vercel` | `vc-domain-verify=strategicmarketingadvisors.com,3060f2f6526f0b30612a` | 600 or provider default |
| TXT | `_vercel` | `vc-domain-verify=www.strategicmarketingadvisors.com,531975bea818d65a394c` | 600 or provider default |

Both TXT records now match and both domains are verified in Vercel. Preserve these values. Earlier incorrect values were corrected by David before verification on 30 October.

## Step 2 — website records, after application readiness is confirmed

Vercel's project-specific recommendations were retrieved after attaching the domains. Recheck them in Project Settings → Domains before cutover in case they change.

| Type | Name | Value | Action |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | Replace old website A record `50.6.5.34` |
| A | `@` | `64.29.17.1` | Add the second address from Vercel's preferred address group |
| CNAME | `www` | `c6a0e1f3e4bc976e.vercel-dns-017.com` | Replace current CNAME to `strategicmarketingadvisors.com` |

Use TTL 600 if supported. Remove conflicting website A/AAAA records only after checking the whole zone. Leave mail and other subdomains intact. The configured `www` address will redirect to `https://strategicmarketingadvisors.com` after verification and cutover.

## Application cutover checklist

Before Step 2: verify ownership; configure exact public-site API origins; add exact custom-domain authentication/recovery callbacks without changing the shared project's unrelated Auth site URL; update canonical URLs, sitemap, robots, llms.txt, organization metadata and public CMS site URL together; deploy and verify. Review `legacy-url-inventory.json`: 24 clear replacements now have explicit 301s, two URLs are retained and 87 need a migration/retirement decision, including old articles and account/checkout pages.

After Step 2: verify DNS, HTTPS certificate, apex/www redirect, public pages, contact form-to-dashboard, consent, Kate's widget allowed domains and David's booking popup on the actual custom domain. Preserve the existing Vercel URL while testing. DNS propagation and certificate issuance may take time. The existing apex record had a four-hour configured TTL when checked.

No DNS edits have been made by Codex. Do not describe the custom domain as launched until those checks pass.

## Backup and legacy pages

A local export of all 55 published posts and 58 published pages was saved as `outputs/legacy-wordpress-public-backup-2026-10-30.json`. This is a content export, not a full WordPress files/database/order backup. David should preserve the old VPS files and database. On 30 October the user confirmed that the old customer pages should be retired. Sixteen account, signup, membership, checkout and related URLs now return a helpful HTTP 410 notice linking to Contact SMA, without redirecting customers into the staff-only dashboard. The remaining unmigrated content is preserved in the export for later review; these old public articles are not silently replaced by unrelated content.

After the real DNS points to Vercel, verify HTTPS and actual on-domain form/booking/widget behavior, then enable a host-specific permanent redirect from the Vercel staging hostname to the real domain. Do not redirect the staging host to the still-old WordPress site before DNS cutover.
