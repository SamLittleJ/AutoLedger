// A one-time message for the sign-in screen, set just before a sign-out the
// app triggers itself (e.g. after deleting the account). The protected route
// redirect opens the sign-in screen, which reads it, then clears it.
let pendingNotice: string | null = null;

export function setSignedOutNotice(message: string) {
  pendingNotice = message;
}

// Pure, so it is safe in a state initializer that React may call twice.
export function peekSignedOutNotice(): string | null {
  return pendingNotice;
}

export function clearSignedOutNotice() {
  pendingNotice = null;
}
