# Security Policy

Security is a first-class maintenance concern for LINGXIFIELD.

## Supported code

Security fixes are applied to the actively maintained `main` branch and to production code paths currently deployed from it.

## Please do not disclose sensitive vulnerabilities publicly

Do not open a public issue containing:

- active credentials or API keys
- private user data
- payment credentials
- exploitable authorization details
- sensitive production configuration
- proof material that would expose users or infrastructure

If you discover a vulnerability, contact the maintainer privately through the contact channel listed on the maintainer's GitHub profile and include:

1. affected route / component / API
2. vulnerability class
3. reproducible steps
4. impact
5. whether authentication is required
6. suggested mitigation, if known

Please keep the report focused and avoid accessing data that does not belong to you.

## High-priority areas

Particular attention is given to:

- authentication and authorization
- IDOR / cross-user access
- upload validation
- unsafe file parsing
- SSRF and server-side URL fetching
- payment callback verification
- billing and refund consistency
- BYOK / secret storage
- database RPC permissions
- signed URLs and downloadable outputs
- task idempotency and duplicate execution
- dependency vulnerabilities

## Safe testing

Only test against accounts, data, files, and infrastructure you are authorized to use.

Do not:

- perform denial-of-service testing against production
- exfiltrate real user data
- publish secrets
- attempt social engineering
- degrade payment or production systems

## Disclosure

The maintainer will review credible reports, reproduce the issue where possible, assess scope, and prioritize fixes based on impact and exploitability.
