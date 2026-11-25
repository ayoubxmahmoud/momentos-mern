// Import the relative time formatter helper from the date-fns library
import { formatDistanceToNow } from "date-fns";

/**
 * Converts a timestamp or date into a human-readable relative time string
 * (e.g., "5 minutes ago", "2 days ago").
 *
 * @param {string | number | Date} createdAt - The creation timestamp from the database.
 * @returns {string} The formatted relative time, or an empty string if no date is provided.
 */
export function formatTimeAgo(createdAt) {
  // Guard clause: return an empty string if createdAt is missing, null, or undefined
  if (!createdAt) return "";

  // Convert ISO date strings (like MongoDB's createdAt) or timestamps into a JS Date object
  const date = new Date(createdAt);

  // Calculate the difference from now and append "ago" / "in" (addSuffix: true)
  return formatDistanceToNow(date, { addSuffix: true });
}
