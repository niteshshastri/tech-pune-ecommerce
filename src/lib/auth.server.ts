import { getRequest } from "@tanstack/react-start/server";
import { publicClient } from "./catalog.server";

/** Returns the signed-in user id when the request carries a valid bearer token, otherwise null. */
export async function getOptionalUserId(): Promise<string | null> {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  if (token.split(".").length !== 3) return null;
  const { data, error } = await publicClient().auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub as string;
}
