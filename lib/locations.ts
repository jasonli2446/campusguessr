import { createClient } from '@supabase/supabase-js' 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string);

export async function getLocations(mapId?: string): Promise<CampusLocations | { error: Error }> {
  const createdByParam = mapId ?? null;
  let query = supabase.from('locations').select('*');
  if (createdByParam === null) {
    query = query.is('created_by', null);
  } else {
    query = query.eq('created_by', createdByParam);
  }

  const { data, error } = await query;

  if (error) {
    return { error };
  }
  return data as CampusLocations;
}
