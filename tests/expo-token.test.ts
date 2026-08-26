import { describe, expect, it } from "vitest";

const easProjectId = "bf21163f-e7ec-4a2f-8274-2a0347530e86";

describe("Expo build authentication", () => {
  it.skipIf(!process.env.EXPO_TOKEN)("can access the linked EAS project with the configured Expo token", async () => {
    const token = process.env.EXPO_TOKEN;
    if (!token) return;

    const response = await fetch(`https://api.expo.dev/v2/projects/${easProjectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok, `Expo token validation failed with HTTP ${response.status}`).toBe(true);
    const body = (await response.json()) as { data?: { id?: string } };
    expect(body.data?.id).toBe(easProjectId);
  }, 30_000);
});

