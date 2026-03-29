/**
 * Clerk auth configuration for DownfieldOS.
 *
 * Clerk provides:
 * - Google OAuth + Apple Sign-In + email/password
 * - Drop-in <SignIn />, <SignUp />, <UserButton /> components
 * - 10K MAU on free tier
 *
 * To activate:
 * 1. Create a Clerk app at clerk.com
 * 2. Set VITE_CLERK_PUBLISHABLE_KEY in .env
 * 3. The ClerkProvider in main.jsx will activate automatically
 */

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY);
