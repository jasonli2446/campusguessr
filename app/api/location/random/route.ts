import { getLocations } from '../../../../lib/locations';
import { z } from 'zod';

const querySchema = z.object({
  created_by: z.string().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), { status: 400 });
  }
  const { created_by } = parsed.data;

  const locations = await getLocations(created_by);
  if ('error' in locations) {
    return new Response(JSON.stringify({ error: locations.error.message }), { status: 500 });
  }
  const index = Math.floor(Math.random() * locations.length);
  return new Response(JSON.stringify({ data: locations[index] }), { status: 200 });
}