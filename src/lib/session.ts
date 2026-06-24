export const SESSION_COOKIE = "rd_session";

/** The opaque token stored in the session cookie once the passcode is verified. */
export function sessionToken(): string {
  return process.env.AUTH_TOKEN ?? "";
}

export function isValidSession(value: string | undefined | null): boolean {
  const expected = sessionToken();
  return !!expected && value === expected;
}
