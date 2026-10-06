# Personal service key entry

The connection page no longer hides its key field when the server's email prop is empty. It checks the authenticated connections API instead. The field remains visible while loading, signed out, or temporarily unavailable; saving remains disabled until the API confirms the session. Signed-out visitors receive a link to the existing sign-in page.

Listed services use the same official default addresses as the backend. The address is prefilled in optional settings. Model discovery remains automatic after saving and checking, with an optional model override. Custom compatible services still require their own address and model: a key alone cannot identify an arbitrary service.

No Vercel variables, provider keys, or provider charges were created. Luma generation remains unavailable in-site; this change does not claim otherwise.

Regression coverage includes API-authenticated sessions without a server email prop, visible signed-out key entry, default address submission, save/check/delete, and nine-language desktop/mobile layout.
