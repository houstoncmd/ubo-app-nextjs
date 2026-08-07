import { betterAuth } from "better-auth";

/**
 * Better Auth configuration for UBO Application.
 *
 * Phase 1: LDAP integration is configured via environment variables.
 * The actual LDAP plugin requires a custom implementation or a third-party package.
 * This setup uses Better Auth's built-in session management with placeholder
 * credentials that will be replaced with LDAP authentication in Phase 2.
 *
 * Environment Variables Required:
 * - BETTER_AUTH_SECRET: Secret key for session signing
 * - LDAP_URL: LDAP server URL (e.g., ldap://ldap.example.com:389)
 * - LDAP_BIND_DN: Bind DN for LDAP authentication
 * - LDAP_BIND_PASSWORD: Bind password
 * - DATABASE_URL: SQLite database path for sessions
 */
export const auth = betterAuth({
  database: {
    url: process.env.DATABASE_URL || "file:./.auth-db.sqlite",
    type: "sqlite",
  },
  secret: process.env.BETTER_AUTH_SECRET || "default-secret-change-me-in-production",
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  /**
   * LDAP Integration Notes:
   *
   * In Phase 2, implement custom LDAP authentication by:
   *
   * 1. Using the `ldapjs` package to connect to the LDAP server:
   *    import ldap from 'ldapjs';
   *
   * 2. Creating a custom endpoint that validates credentials against LDAP:
   *    - Bind with user's credentials
   *    - Search for user attributes
   *    - Map LDAP profile to Better Auth user
   *
   * 3. Example LDAP client configuration:
   *    const client = ldap.createClient({
   *      url: process.env.LDAP_URL,
   *    });
   *
   *    client.bind(userDN, password, (err) => {
   *      if (err) return res.status(401).json({ error: 'Invalid credentials' });
   *      // Search for user attributes
   *      // Create/update session
   *    });
   *
   * 4. Environment variables for LDAP:
   *    LDAP_URL=ldap://ldap.example.com:389
   *    LDAP_BIND_DN=cn=admin,dc=example,dc=com
   *    LDAP_BIND_PASSWORD=***
   *    LDAP_SEARCH_BASE=dc=example,dc=com
   *    LDAP_SEARCH_FILTER=(uid={{username}})
   */
  user: {
    additionalFields: {
      employeeId: {
        type: "string",
        required: false,
      },
      ldapDn: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    additionalFields: {
      ldapUsername: {
        type: "string",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
