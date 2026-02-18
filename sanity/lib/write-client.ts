import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Server-only write client — never import this in client components
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
