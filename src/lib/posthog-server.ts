import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

/**
 * Returns a singleton PostHog server-side client.
 * Use in API routes and server actions.
 * Always call `await posthog.shutdown()` at the end of short-lived requests.
 */
export function getPostHogClient(): PostHog {
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    });
  }
  return _client;
}
