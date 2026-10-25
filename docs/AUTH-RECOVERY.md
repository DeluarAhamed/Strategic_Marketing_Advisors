# SMA account recovery

The selected Supabase project shares its Auth users with the existing application. The requested owner email was already registered, confirmed and assigned SMA owner membership. Repeating signup does not replace that account's password; its generic success response must not be treated as proof that a new account or password was created.

The admin UI now offers `/admin?mode=recover` to request a recovery email and `/admin?mode=reset` to accept the provider's recovery session. The callback consumes only recovery-type fragments, clears the fragment from browser history, and requires Supabase to verify the user before a password update. The user personally enters and submits the new password. No agent-generated password or SQL update to Auth records is used.

The project originally allowed only the Orthopaedic reset destination. SMA recovery needs the exact additional allowlisted URL `https://strategic-marketing-advisors.vercel.app/admin?mode=reset`. Preserve the existing Site URL and Orthopaedic redirect. Adding the SMA redirect requires the user's approval because it defines where recovery sessions may be delivered.

Resetting this existing account also changes its password for other applications using that same Supabase Auth account. The reset form explicitly explains that consequence. Dashboard membership and roles are unchanged.

The generic signup response now explains that existing passwords are unchanged and points people to sign-in/recovery. Account creation and recovery are separate, clearly labeled screens. Recovery requests and the new-password submission are user actions; their completion is not claimed before verification.
