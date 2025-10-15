import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const demoAccounts = [
  {
    email: 'monitor@bemo.com',
    password: 'demo1234',
    full_name: '김모니터',
    role: 'AGENT',
  },
  {
    email: 'manager@bemo.com',
    password: 'demo1234',
    full_name: '이관리',
    role: 'MANAGER',
  },
  {
    email: 'admin@bemo.com',
    password: 'demo1234',
    full_name: '박관리자',
    role: 'ADMIN',
  },
]

async function createDemoAccounts() {
  console.log('🚀 Creating demo accounts...\n')

  // Get GS타워 building ID
  const { data: building } = await supabase
    .from('buildings')
    .select('id')
    .eq('name', 'GS타워')
    .single()

  if (!building) {
    console.error('❌ GS타워 building not found')
    return
  }

  console.log(`✅ Found building: GS타워 (${building.id})\n`)

  for (const account of demoAccounts) {
    console.log(`Creating account: ${account.email}`)

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers()
      const userExists = existingUser.users.find((u) => u.email === account.email)

      let userId: string

      if (userExists) {
        console.log(`  ℹ️  User already exists, updating password...`)
        userId = userExists.id

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          password: account.password,
          email_confirm: true,
        })

        if (updateError) {
          console.error(`  ❌ Error updating password:`, updateError.message)
          continue
        }
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.full_name,
            role: account.role,
          },
        })

        if (createError) {
          console.error(`  ❌ Error creating user:`, createError.message)
          continue
        }

        userId = newUser.user.id
        console.log(`  ✅ User created: ${userId}`)
      }

      // Update or create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: account.full_name,
          role: account.role,
          building_id: building.id,
        })

      if (profileError) {
        console.error(`  ❌ Error creating profile:`, profileError.message)
        continue
      }

      console.log(`  ✅ Profile updated`)
      console.log(`  📧 Email: ${account.email}`)
      console.log(`  🔑 Password: ${account.password}`)
      console.log(`  👤 Role: ${account.role}\n`)
    } catch (error: any) {
      console.error(`  ❌ Error:`, error.message)
    }
  }

  console.log('✨ Demo accounts setup complete!')
}

createDemoAccounts()
