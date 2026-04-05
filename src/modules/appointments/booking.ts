export function buildBookingMessage(
  firstName: string | null | undefined,
  bookingUrl: string
): string {
  const name = firstName ? ` ${firstName}` : "";
  return (
    `Thanks${name}! Based on what you've shared, a proper cover review would be really valuable.\n\n` +
    "I've set up a free 15-minute call with Kiru, a licensed Liberty adviser. " +
    "Pick a time that works for you:\n\n" +
    `📅 ${bookingUrl}\n\n` +
    "No obligation, just a chat."
  );
}
