---
title: DNS, domains & certificates
description: Domains we own, where DNS is hosted, and how TLS certificates are renewed.
sidebar:
  order: 3
---

If a domain expires, everything that uses it goes down at once. Check this page often.

## Domains

| Domain | Registrar | Expires | Auto-renew? | Registrar account |
| --- | --- | --- | --- | --- |
| TODO: example.com | TODO | TODO: YYYY-MM-DD | TODO | See [Vendor accounts](/access/vendor-accounts/) |

## DNS

TODO: Where is DNS hosted (Cloudflare, Route 53, the registrar)? Is it managed in code or by hand?

| Record | Type | Points to | Why |
| --- | --- | --- | --- |
| TODO: `example.com` | A / CNAME | TODO | Main site |
| TODO: `api.example.com` | CNAME | TODO | API |
| TODO: MX, SPF, DKIM, DMARC | | | Email delivery; breaking these sends our mail to spam |

## TLS certificates

| Covers | Issued by | Renewal | Expires |
| --- | --- | --- | --- |
| TODO: `*.example.com` | e.g. Let's Encrypt / ACM | e.g. automatic via TODO | TODO |

### Check when a certificate expires

```sh
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -noout -enddate
```

### Renew a certificate by hand

TODO: Exact steps, in case automatic renewal fails.
