import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function fixProfileBuilding() {
  console.log('Fixing profile building_id...');

  // Get the building
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('name', 'GS타워')
    .single();

  if (buildingError || !building) {
    console.error('Error getting building:', buildingError);
    return;
  }

  console.log('Found building:', building.name, building.id);

  // Update all profiles with null building_id
  const { data: updatedProfiles, error: updateError } = await supabase
    .from('profiles')
    .update({ building_id: building.id })
    .is('building_id', null)
    .select();

  if (updateError) {
    console.error('Error updating profiles:', updateError);
    return;
  }

  console.log(`✅ Updated ${updatedProfiles?.length || 0} profiles with building_id`);
}

fixProfileBuilding().catch(console.error);
