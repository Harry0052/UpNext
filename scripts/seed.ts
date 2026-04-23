/**
 * Seed script for UpNext
 * Run with: npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CAMPUSES = [
  { name: 'Stanford University', slug: 'stanford', domain: 'stanford.edu', location: 'Stanford, CA' },
  { name: 'MIT', slug: 'mit', domain: 'mit.edu', location: 'Cambridge, MA' },
  { name: 'UC Berkeley', slug: 'berkeley', domain: 'berkeley.edu', location: 'Berkeley, CA' },
  { name: 'Harvard University', slug: 'harvard', domain: 'harvard.edu', location: 'Cambridge, MA' },
  { name: 'Carnegie Mellon University', slug: 'cmu', domain: 'cmu.edu', location: 'Pittsburgh, PA' },
  { name: 'University of Michigan', slug: 'umich', domain: 'umich.edu', location: 'Ann Arbor, MI' },
  { name: 'Georgia Tech', slug: 'gatech', domain: 'gatech.edu', location: 'Atlanta, GA' },
  { name: 'University of Texas at Austin', slug: 'utexas', domain: 'utexas.edu', location: 'Austin, TX' },
  { name: 'Columbia University', slug: 'columbia', domain: 'columbia.edu', location: 'New York, NY' },
  { name: 'University of Washington', slug: 'uw', domain: 'uw.edu', location: 'Seattle, WA' },
  { name: 'UCLA', slug: 'ucla', domain: 'ucla.edu', location: 'Los Angeles, CA' },
  { name: 'Yale University', slug: 'yale', domain: 'yale.edu', location: 'New Haven, CT' },
  { name: 'Princeton University', slug: 'princeton', domain: 'princeton.edu', location: 'Princeton, NJ' },
  { name: 'Cornell University', slug: 'cornell', domain: 'cornell.edu', location: 'Ithaca, NY' },
  { name: 'University of Illinois', slug: 'uiuc', domain: 'illinois.edu', location: 'Champaign, IL' },
]

const DEMO_USERS = [
  { email: 'alex@stanford.edu', handle: 'alexbuilds', display_name: 'Alex Chen', role: 'founder', bio: 'Building the future of education. YC W25.', building_description: 'An AI tutor that adapts to each student\'s learning style using LLMs and spaced repetition', major: 'Computer Science', graduation_year: 2026 },
  { email: 'maya@mit.edu', handle: 'mayaships', display_name: 'Maya Patel', role: 'engineer', bio: 'Full-stack engineer obsessed with developer tools.', building_description: 'A collaborative code review platform that uses AI to suggest improvements and catch bugs', major: 'EECS', graduation_year: 2025 },
  { email: 'jordan@berkeley.edu', handle: 'jordandesigns', display_name: 'Jordan Rivera', role: 'designer', bio: 'Product designer who codes. Previously at Figma.', building_description: 'A design system generator that creates component libraries from screenshots', major: 'Cognitive Science', graduation_year: 2026 },
  { email: 'sam@harvard.edu', handle: 'samstartup', display_name: 'Sam Williams', role: 'founder', bio: 'Serial builder. 3 side projects and counting.', building_description: 'A marketplace connecting college students with local businesses for freelance work', major: 'Economics', graduation_year: 2027 },
  { email: 'priya@cmu.edu', handle: 'priyaml', display_name: 'Priya Sharma', role: 'researcher', bio: 'ML researcher turned founder. NeurIPS published.', building_description: 'An AI-powered research assistant that helps students find and synthesize academic papers', major: 'Machine Learning', graduation_year: 2025 },
  { email: 'marcus@gatech.edu', handle: 'marcusops', display_name: 'Marcus Johnson', role: 'operator', bio: 'GTM and growth. Made a campus app hit 5K users.', building_description: 'A campus events platform that uses social graphs to recommend events you\'ll actually attend', major: 'Business Administration', graduation_year: 2026 },
  { email: 'emma@columbia.edu', handle: 'emmabuilder', display_name: 'Emma Okafor', role: 'founder', bio: 'Fintech enthusiast. Building for Gen Z.', building_description: 'A split-payment app for college students that integrates with dining halls and group orders', major: 'Computer Science', graduation_year: 2026 },
  { email: 'kai@uw.edu', handle: 'kaidev', display_name: 'Kai Zhang', role: 'engineer', bio: 'Systems engineer. Love Rust and performance.', building_description: 'An open-source alternative to Notion optimized for speed and offline-first collaboration', major: 'Computer Engineering', graduation_year: 2025 },
  { email: 'sofia@ucla.edu', handle: 'sofiacreates', display_name: 'Sofia Martinez', role: 'creator', bio: 'Content creator and community builder. 50K on TikTok.', building_description: 'A creator economy platform that helps student influencers monetize their campus following', major: 'Communications', graduation_year: 2027 },
  { email: 'ryan@umich.edu', handle: 'ryanmarket', display_name: 'Ryan Kim', role: 'marketer', bio: 'Growth marketing nerd. SEO and paid ads.', building_description: 'An SEO tool specifically designed for student-run businesses and campus organizations', major: 'Marketing', graduation_year: 2026 },
]

const DEMO_PROJECTS = [
  { name: 'StudySync AI', slug: 'studysync-ai', tagline: 'AI tutor that adapts to your learning style', stage: 'building', description: 'StudySync AI uses LLMs and spaced repetition to create personalized learning paths. We analyze how you learn and adapt in real-time.' },
  { name: 'CodeReview.ai', slug: 'codereview-ai', tagline: 'AI-powered collaborative code review', stage: 'launched', description: 'Stop shipping bugs. CodeReview.ai catches issues before they hit production with AI-assisted code review that learns your codebase.' },
  { name: 'DesignKit', slug: 'designkit', tagline: 'Generate design systems from screenshots', stage: 'idea', description: 'Upload any UI screenshot and get a full component library with tokens, variants, and code.' },
  { name: 'CampusGig', slug: 'campusgig', tagline: 'Freelance marketplace for college students', stage: 'growing', description: 'Connecting talented students with local businesses. From web design to social media management — find work that fits your schedule.' },
  { name: 'PaperTrail', slug: 'papertrail', tagline: 'AI research assistant for academics', stage: 'launched', description: 'Find, read, and synthesize papers 10x faster. PaperTrail understands context and connects ideas across your research.' },
  { name: 'CampusVibes', slug: 'campusvibes', tagline: 'Never miss an event that matters', stage: 'building', description: 'Smart event discovery for college campuses. We use your social graph and interests to surface the events you actually want to attend.' },
  { name: 'SplitEasy', slug: 'spliteasy', tagline: 'Group payments for college life', stage: 'funded', description: 'Split dining hall meals, group orders, and bills seamlessly. Integrates with campus card systems.' },
  { name: 'VeloNotes', slug: 'velonotes', tagline: 'Lightning-fast collaborative notes', stage: 'building', description: 'An open-source, offline-first note-taking app built in Rust. Blazing fast even with thousands of documents.' },
]

const DEMO_POSTS = [
  { type: 'launch', content: '🚀 Just launched StudySync AI on Product Hunt! After 6 months of building, we\'re live. Our AI tutor has already helped 200+ students improve their grades. Check it out and let us know what you think!', project_index: 0, author_index: 0 },
  { type: 'ask', content: 'Looking for a React Native developer to help build the mobile app for CampusGig. We have 500 active users on web and need to go mobile ASAP. Equity + small stipend available. DM me!', project_index: 3, author_index: 3 },
  { type: 'win', content: 'Just closed our pre-seed round! $500K from Contrary and some amazing angels. SplitEasy is going to change how students handle group payments. Grateful for this community 🙏', project_index: 6, author_index: 6 },
  { type: 'learn', content: 'Lesson learned from our first 1000 users: don\'t build features nobody asked for. We spent 3 weeks on a "social feed" when all our users wanted was faster paper search. Listen to your users, not your ego.', project_index: 4, author_index: 4 },
  { type: 'update', content: 'Week 12 update on VeloNotes:\n\n- Implemented CRDT-based collaboration\n- Offline sync is working!\n- Performance benchmarks: 3x faster than Notion for large docs\n- Next up: plugin system\n\nOpen source repo has 200 stars!', project_index: 7, author_index: 7 },
  { type: 'ask', content: 'Anyone here have experience with campus dining API integrations? Working on SplitEasy and the documentation is... nonexistent. Would love to chat with anyone who\'s dealt with campus card systems.', project_index: 6, author_index: 6 },
  { type: 'launch', content: 'DesignKit v0.1 is live! 🎨\n\nUpload any screenshot and get:\n✅ Color palette extraction\n✅ Typography detection\n✅ Component hierarchy\n✅ Tailwind CSS code\n\nStill early but the magic is real. Try it free!', project_index: 2, author_index: 2 },
  { type: 'win', content: 'CampusVibes just hit 5,000 users across 3 campuses! 🎉\n\nWhat worked: partnering with student orgs for launch events. Each org brought their community. Organic growth from there.', project_index: 5, author_index: 5 },
  { type: 'update', content: 'Shipped dark mode, keyboard shortcuts, and a CLI for CodeReview.ai this week. Users have been asking for these since day 1. Sometimes the best feature is the one that already has 50 upvotes on your feedback board.', project_index: 1, author_index: 1 },
  { type: 'learn', content: 'Hot take: as a student founder, your biggest advantage isn\'t cheap labor or free time. It\'s that you ARE your target user. You feel the pain every day. Don\'t lose that by trying to "think like a real company."', author_index: 0 },
]

const DEMO_EVENTS = [
  { title: 'Stanford Startup Showcase', slug: 'stanford-startup-showcase-2026', type: 'demo_day', description: 'Annual showcase of student-built startups. Present your project to VCs, angels, and fellow builders.', location: 'Huang Engineering Center', start_offset_days: 14 },
  { title: 'HackMIT 2026', slug: 'hackmit-2026', type: 'hackathon', description: 'MIT\'s flagship hackathon. 36 hours of building, workshops, and networking. $50K in prizes.', location: 'MIT Media Lab', start_offset_days: 30 },
  { title: 'Berkeley AI Workshop', slug: 'berkeley-ai-workshop', type: 'workshop', description: 'Hands-on workshop on building production AI applications. Covers RAG, fine-tuning, and deployment.', location: 'Soda Hall', start_offset_days: 7 },
  { title: 'Founder Fireside: How We Got Our First 100 Users', slug: 'founder-fireside-first-100', type: 'speaker', description: 'Hear from 3 student founders about their unconventional strategies for early traction.', is_virtual: true, start_offset_days: 3 },
  { title: 'NYC Builder Meetup', slug: 'nyc-builder-meetup-apr', type: 'meetup', description: 'Monthly meetup for student builders in NYC. Demo your project, get feedback, make friends.', location: 'WeWork SoHo', start_offset_days: 10 },
]

const FEATURE_FLAGS = [
  { key: 'org_seats', description: 'Organization team seats (monetization)' },
  { key: 'recruiting_access', description: 'Recruiter access tier for companies' },
  { key: 'sponsorship_tools', description: 'Sponsored content and promotion tools' },
  { key: 'waitlist_mode', description: 'Enable waitlist for new signups' },
  { key: 'email_digest', description: 'Weekly email digest system' },
  { key: 'campus_leaderboard', description: 'Campus activity leaderboard' },
]

async function seed() {
  console.log('🌱 Seeding database...')

  // 1. Seed campuses
  console.log('📍 Creating campuses...')
  const { data: campuses, error: campusError } = await supabase
    .from('campuses')
    .upsert(CAMPUSES, { onConflict: 'slug' })
    .select()

  if (campusError) {
    console.error('Campus error:', campusError)
    return
  }
  console.log(`  ✓ ${campuses.length} campuses created`)

  // 2. Create auth users and profiles
  console.log('👤 Creating users...')
  const userIds: string[] = []

  for (const demoUser of DEMO_USERS) {
    const campusDomain = demoUser.email.split('@')[1]
    const campus = campuses.find((c) => c.domain === campusDomain)

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: 'Demo1234!',
      email_confirm: true,
    })

    if (authError) {
      // User might already exist
      console.log(`  ⚠ ${demoUser.email}: ${authError.message}`)
      // Try to get existing user
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users?.find((u) => u.email === demoUser.email)
      if (existing) {
        userIds.push(existing.id)
        // Update profile
        await supabase.from('users').upsert({
          id: existing.id,
          handle: demoUser.handle,
          display_name: demoUser.display_name,
          role: demoUser.role,
          bio: demoUser.bio,
          building_description: demoUser.building_description,
          campus_id: campus?.id,
          major: demoUser.major,
          graduation_year: demoUser.graduation_year,
          onboarding_completed: true,
          is_verified: true,
          is_admin: demoUser.email === 'alex@stanford.edu',
        }, { onConflict: 'id' })
      }
      continue
    }

    const userId = authData.user.id
    userIds.push(userId)

    // Update user profile
    await supabase.from('users').upsert({
      id: userId,
      handle: demoUser.handle,
      display_name: demoUser.display_name,
      role: demoUser.role,
      bio: demoUser.bio,
      building_description: demoUser.building_description,
      campus_id: campus?.id,
      major: demoUser.major,
      graduation_year: demoUser.graduation_year,
      onboarding_completed: true,
      is_verified: true,
      is_admin: demoUser.email === 'alex@stanford.edu',
    }, { onConflict: 'id' })

    // Add skills
    const skills = ['React', 'TypeScript', 'Next.js', 'Python'].slice(0, 3 + Math.floor(Math.random() * 3))
    await supabase.from('user_skills').upsert(
      skills.map((skill) => ({ user_id: userId, skill })),
      { onConflict: 'user_id,skill' }
    )

    // Add interests
    const interests = ['AI/ML', 'SaaS', 'Developer Tools', 'Consumer Apps'].slice(0, 2 + Math.floor(Math.random() * 2))
    await supabase.from('user_interests').upsert(
      interests.map((interest) => ({ user_id: userId, interest })),
      { onConflict: 'user_id,interest' }
    )

    console.log(`  ✓ ${demoUser.display_name} (@${demoUser.handle})`)
  }

  // 3. Create follows (everyone follows everyone for demo purposes)
  console.log('🤝 Creating follow connections...')
  const follows = []
  for (let i = 0; i < userIds.length; i++) {
    for (let j = 0; j < userIds.length; j++) {
      if (i !== j && Math.random() > 0.3) {
        follows.push({ follower_id: userIds[i], following_id: userIds[j] })
      }
    }
  }
  await supabase.from('follows').upsert(follows, { onConflict: 'follower_id,following_id' })
  console.log(`  ✓ ${follows.length} follow connections`)

  // 4. Create projects
  console.log('📦 Creating projects...')
  const projectIds: string[] = []

  for (let i = 0; i < DEMO_PROJECTS.length; i++) {
    const project = DEMO_PROJECTS[i]
    const authorId = userIds[i % userIds.length]
    const campus = campuses[i % campuses.length]

    const { data, error } = await supabase
      .from('projects')
      .upsert({
        ...project,
        created_by: authorId,
        campus_id: campus.id,
        is_featured: i < 3,
      }, { onConflict: 'slug' })
      .select('id')
      .single()

    if (error) {
      console.log(`  ⚠ ${project.name}: ${error.message}`)
      const { data: existing } = await supabase.from('projects').select('id').eq('slug', project.slug).single()
      if (existing) projectIds.push(existing.id)
      continue
    }

    projectIds.push(data.id)

    // Add creator as member
    await supabase.from('project_members').upsert({
      project_id: data.id,
      user_id: authorId,
      role: 'Founder',
    }, { onConflict: 'project_id,user_id' })

    // Add another team member
    const teammateId = userIds[(i + 1) % userIds.length]
    await supabase.from('project_members').upsert({
      project_id: data.id,
      user_id: teammateId,
      role: 'Lead Engineer',
    }, { onConflict: 'project_id,user_id' })

    // Add tags
    const tags = ['AI', 'Education', 'SaaS', 'Mobile', 'Marketplace'].slice(0, 2 + Math.floor(Math.random() * 2))
    for (const tag of tags) {
      await supabase.from('project_tags').upsert({ project_id: data.id, tag }, { onConflict: 'project_id,tag' })
    }

    // Add milestones
    await supabase.from('project_milestones').upsert([
      { project_id: data.id, title: 'MVP Built', sort_order: 0, completed_at: new Date().toISOString() },
      { project_id: data.id, title: 'First 100 Users', sort_order: 1, completed_at: i > 3 ? new Date().toISOString() : null },
      { project_id: data.id, title: 'Product-Market Fit', sort_order: 2 },
    ], { onConflict: 'id' })

    // Add roles needed
    await supabase.from('project_roles_needed').upsert([
      { project_id: data.id, title: 'Frontend Developer', description: 'React/Next.js experience preferred' },
      { project_id: data.id, title: 'Growth Marketer', description: 'Help us reach more campuses' },
    ], { onConflict: 'id' })

    console.log(`  ✓ ${project.name}`)
  }

  // 5. Create posts
  console.log('📝 Creating posts...')
  for (const post of DEMO_POSTS) {
    const authorId = userIds[post.author_index]
    const projectId = post.project_index !== undefined ? projectIds[post.project_index] : null

    await supabase.from('posts').insert({
      author_id: authorId,
      project_id: projectId,
      type: post.type,
      content: post.content,
    })
  }
  console.log(`  ✓ ${DEMO_POSTS.length} posts created`)

  // 6. Create events
  console.log('📅 Creating events...')
  for (let i = 0; i < DEMO_EVENTS.length; i++) {
    const event = DEMO_EVENTS[i]
    const campus = campuses[i % campuses.length]
    const organizer = userIds[i % userIds.length]
    const start = new Date()
    start.setDate(start.getDate() + event.start_offset_days)
    const end = new Date(start)
    end.setHours(end.getHours() + 3)

    await supabase.from('events').upsert({
      title: event.title,
      slug: event.slug,
      type: event.type,
      description: event.description,
      location: event.location || null,
      is_virtual: event.is_virtual || false,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      campus_id: campus.id,
      organizer_id: organizer,
      is_featured: i < 2,
    }, { onConflict: 'slug' })
  }
  console.log(`  ✓ ${DEMO_EVENTS.length} events created`)

  // 7. Create feature flags
  console.log('🚩 Creating feature flags...')
  for (const flag of FEATURE_FLAGS) {
    await supabase.from('feature_flags').upsert(flag, { onConflict: 'key' })
  }
  console.log(`  ✓ ${FEATURE_FLAGS.length} feature flags`)

  // 8. Create some vouches
  console.log('🤝 Creating vouches...')
  for (let i = 0; i < 5; i++) {
    const voucher = userIds[i]
    const vouchee = userIds[(i + 1) % userIds.length]
    await supabase.from('vouches').insert({
      voucher_id: voucher,
      vouchee_id: vouchee,
      skill: 'React',
      message: 'Excellent developer, ships fast and writes clean code.',
    }).catch(() => {}) // Ignore duplicates
  }
  console.log('  ✓ Vouches created')

  console.log('\n✅ Seed complete!')
  console.log('\nDemo credentials:')
  console.log('  Email: alex@stanford.edu (admin)')
  console.log('  Password: Demo1234!')
  console.log('\n  Any demo user: <name>@<school>.edu / Demo1234!')
}

seed().catch(console.error)
