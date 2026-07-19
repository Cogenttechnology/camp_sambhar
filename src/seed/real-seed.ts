/**
 * Seed the CMS with the client's REAL Phase-1 content pack:
 * every photograph, the full SaltBox menu (194 items), the authentic About /
 * Bird Watching / Stargazing / Sustainability copy, real policies and contacts.
 */
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import sharpLib from 'sharp'
import { lexicalFromParagraphs, lexicalRich } from './lexical'
import { CONTACT, ABOUT, BIRDING, STARGAZING, SUSTAINABILITY, POLICIES, BIRD_GROUPS } from './data/content'
import menuData from './data/menu.json'

// ── env ──
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !line.trim().startsWith('#')) {
      const [, k, v] = m
      if (!(k in process.env)) process.env[k] = v.replace(/^["']|["']$/g, '')
    }
  }
}

const PACK = path.resolve(process.cwd(), 'Camp Sambhar Resort Website Content - Phase 1 - Cogent')
const ADMIN_EMAIL = 'admin@campsambhar.com'
const ADMIN_PASSWORD = 'ChangeMe123!'

const run = async () => {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  /** Upload a photo from the content pack, normalized to web-friendly JPEG.
   *  `cropBottomPct` trims a strip off the bottom (used to remove burned-in
   *  camera watermarks before the image is published). */
  const up = async (
    relPath: string,
    alt: string,
    opts: { cropBottomPct?: number } = {},
  ): Promise<number | null> => {
    const abs = path.join(PACK, relPath)
    if (!fs.existsSync(abs)) {
      console.warn('   ! missing:', relPath)
      return null
    }
    try {
      const raw = fs.readFileSync(abs)
      let pipeline = sharpLib(raw, { failOn: 'none' }).rotate()

      if (opts.cropBottomPct) {
        const meta = await sharpLib(raw, { failOn: 'none' }).rotate().metadata()
        if (meta.width && meta.height) {
          const keep = Math.round(meta.height * (1 - opts.cropBottomPct / 100))
          pipeline = pipeline.extract({ left: 0, top: 0, width: meta.width, height: keep })
        }
      }

      const buf = await pipeline
        .resize({ width: 2000, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()
      const name = path
        .basename(relPath)
        .replace(/\.[a-z]+$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const doc = await payload.create({
        collection: 'media',
        data: { alt },
        file: { data: buf, name: `${name}.jpg`, mimetype: 'image/jpeg', size: buf.length },
      })
      return doc.id as number
    } catch (err) {
      console.warn('   ! failed:', relPath, (err as Error).message)
      return null
    }
  }

  /** Upload every image in a folder; returns ids in order. */
  const upFolder = async (relDir: string, altBase: string): Promise<number[]> => {
    const abs = path.join(PACK, relDir)
    if (!fs.existsSync(abs)) return []
    const files = fs
      .readdirSync(abs)
      .filter((f) => /\.(jpe?g|png)$/i.test(f))
      .sort()
    const ids: number[] = []
    for (const [i, f] of files.entries()) {
      const id = await up(path.join(relDir, f), `${altBase} — ${i + 1}`)
      if (id) ids.push(id)
    }
    return ids
  }

  // ── 1. Admin user ──
  console.log('→ Admin user')
  if ((await payload.find({ collection: 'users', limit: 1 })).totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Camp Sambhar Admin' },
    })
  }

  // ── 2. Media by section ──
  console.log('→ Photos: Swiss Tent Cottage')
  const swissInt = await upFolder('Swiss Tent Cottage •/Interior - Swiss Tent Cottage', 'Swiss Tent Cottage interior at Camp Sambhar')
  const swissExt = await upFolder('Swiss Tent Cottage •/Exterior - Swiss Tent Cottage', 'Swiss Tent Cottage exterior at Camp Sambhar')

  console.log('→ Photos: Hiking Tent')
  // Lead with the shot of guests around the fire pit (t-4) — it shows the
  // experience rather than empty equipment, and it is far brighter than t-1/t-2.
  const hikingOrder = [
    'Camp Sambhar Hiking T-4.jpeg',
    'Camp Sambhar Hiking T-5.jpeg',
    'Camp Sambhar Hiking T-2.jpeg',
    'Camp Sambhar Hiking T-1.jpeg',
  ]
  const hiking: number[] = []
  for (const [i, file] of hikingOrder.entries()) {
    const id = await up(`Hiking Tent •/Hiking Tent - pictures/${file}`, `Hiking tents at Camp Sambhar — ${i + 1}`)
    if (id) hiking.push(id)
  }

  console.log('→ Photos: Pool')
  const pool = await upFolder('POOL •', 'The pool at Camp Sambhar Resort')

  console.log('→ Photos: Stargazing')
  const stars = await upFolder('Stargazing at Sambhar Lake •', 'Stargazing at Sambhar Lake')

  console.log('→ Photos: Birds')
  const birdsMain = await upFolder('Bird of Sambhar •', 'Flamingos and migratory birds at Sambhar Lake')
  const birdsAbed = await upFolder('Bird of Sambhar •/Bird of Sambhar by Abed', 'Birds of Sambhar Lake')
  const birdsD = await upFolder('Bird of Sambhar •/Bird of Sambhar by D', 'Birds of Sambhar Lake')
  const birds = [...birdsMain, ...birdsAbed, ...birdsD]

  console.log('→ Photos: Restaurant')
  // Lead with the daytime exterior (bottom-cropped to remove the camera watermark),
  // then interiors — so the café hero reads bright and architectural, not night-lit.
  const restHero = await up(
    'Restaurant - SALTBOX •/Exterior - SaltBox Restaurant/Restaurant Interior  -Pictures/Resturant.jpg',
    'The SaltBox Restaurant at Camp Sambhar — stone and glass under a clear Rajasthan sky',
    { cropBottomPct: 6 },
  )
  const restInt = await upFolder(
    'Restaurant - SALTBOX •/Interior Video - SaltBox Restaurant/Restaurant Interior - Pictures',
    'Inside the SaltBox Restaurant',
  )
  const restInt2 = await upFolder(
    'Restaurant - SALTBOX •/Exterior - SaltBox Restaurant/Restaurant Interior  -Pictures',
    'SaltBox Restaurant',
  )
  const restaurant = [restHero, ...restInt, ...restInt2].filter(Boolean) as number[]

  console.log('→ Photos: Kitchen, Drone, Team')
  const kitchen = await upFolder('Kitchen •/Raw Pictures - Kitchen', 'The kitchen at Camp Sambhar Resort')
  const drone = await upFolder('Drone Shoot •/Drone Shoot - Pictures', 'Aerial view of Camp Sambhar Resort and the salt lake')
  const team = await upFolder('Team - Camp Family •', 'The Camp Sambhar family')

  const pick = (arr: number[], i = 0) => arr[i] ?? arr[0] ?? null
  const heroImg = pick(drone) ?? pick(birds) ?? pick(swissExt)!
  const logoImg = await up(
    'Logo - Camp Sambhar Resort •/Camp Sambhar_Logo final/Camp Sambhar_Logo final/Camp Sambhar_Final.png',
    'Camp Sambhar Resort logo',
  )

  console.log(
    `   media: swiss ${swissInt.length + swissExt.length}, hiking ${hiking.length}, pool ${pool.length}, stars ${stars.length}, birds ${birds.length}, restaurant ${restaurant.length}, kitchen ${kitchen.length}, drone ${drone.length}, team ${team.length}`,
  )

  // ── 3. Site settings ──
  console.log('→ Site settings')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: CONTACT.siteName,
      tagline: CONTACT.tagline,
      logo: logoImg ?? undefined,
      phone: CONTACT.phone,
      whatsappNumber: CONTACT.phone.replace(/[^\d]/g, ''),
      email: CONTACT.bookingEmail,
      address: CONTACT.address,
      businessHours: `Office ${CONTACT.officeHours}`,
      mapLat: 26.9167,
      mapLng: 75.0833,
      mapEmbedUrl: CONTACT.mapUrl,
      directions:
        'Village Jhapok, Shakambhari Mata Temple Road, Sambhar Lake — about 80 km from Jaipur.',
      priceRange: '₹₹₹',
      defaultMetaDescription:
        "Camp Sambhar Resort — an eco-luxury camp on Asia's largest inland salt lake. 180° views of white salt flats, thousands of pink flamingos, guided birding, stargazing and the SaltBox restaurant.",
      defaultOgImage: heroImg,
      googleBusinessProfileUrl: CONTACT.mapUrl,
      socials: CONTACT.socials,
    },
  })

  // ── 4. Rooms (real stays) ──
  console.log('→ Rooms')
  const rooms = [
    {
      title: 'Swiss Tent Cottage',
      slug: 'swiss-tent-cottage',
      category: 'luxury-tent',
      hero: pick(swissInt),
      gallery: [...swissInt.slice(1), ...swissExt],
      short:
        'Wood-and-canvas Swiss cottages with ensuite comforts, opening to a 180° view of the white salt flats.',
      paras: [
        'Our Swiss Tent Cottages are the heart of Camp Sambhar — built from wood and canvas, styled in the raw colours of Rajasthan, and placed so that the lake is the first thing you see each morning.',
        'Each cottage is ensuite, comfortably furnished for couples and families, and just steps from the restaurant, the pool and the shoreline where the flamingos gather.',
      ],
      adults: 3,
      price: 6500,
    },
    {
      title: 'Hiking Tent',
      slug: 'hiking-tent',
      category: 'family-tent',
      hero: pick(hiking),
      gallery: hiking.slice(1),
      short:
        'A lighter, adventurous way to sleep under the Sambhar sky — simple, sociable and close to the land.',
      paras: [
        'For guests who want the outdoors a little closer, our hiking tents offer a simpler, more adventurous night at the camp.',
        'Perfect for groups, students and young travellers, they sit within easy reach of the campfire, the restaurant and the best stargazing spots on the property.',
      ],
      adults: 2,
      price: 3500,
    },
  ]
  let order = 0
  for (const r of rooms) {
    if (!r.hero) continue
    await payload.create({
      collection: 'rooms',
      data: {
        title: r.title,
        slug: r.slug,
        category: r.category as never,
        shortDescription: r.short,
        description: lexicalFromParagraphs(r.paras) as never,
        heroImage: r.hero,
        gallery: r.gallery.filter(Boolean).map((image) => ({ image })),
        maxAdults: r.adults,
        priceFrom: r.price,
        amenities: [
          { label: 'Ensuite bathroom' },
          { label: '180° salt-lake view' },
          { label: 'Pool access' },
          { label: 'In-tent dining available' },
          { label: 'Backup power' },
        ],
        order: order++,
      },
    })
  }

  // ── 5. Experiences (real copy) ──
  console.log('→ Experiences')
  const experiences = [
    {
      title: BIRDING.title,
      slug: 'bird-watching',
      category: 'nature',
      hero: pick(birds),
      gallery: birds.slice(1, 9),
      teaser:
        "Sambhar Lake is a Ramsar Wetland of International Importance — a paradise of flamingos, pelicans, painted storks and over a hundred recorded species.",
      paras: BIRDING.intro,
      highlights: BIRDING.highlights,
      duration: '2–3 hours',
      bestTime: 'Winter migration season, sunrise and early morning',
    },
    {
      title: STARGAZING.title,
      slug: 'stargazing',
      category: 'astronomy',
      hero: pick(stars),
      gallery: stars.slice(1),
      teaser:
        'Professionally guided night-sky sessions with telescopes and laser sky tours, under some of Rajasthan’s darkest skies.',
      paras: STARGAZING.intro,
      highlights: STARGAZING.highlights,
      duration: '1.5–2 hours',
      bestTime: 'Clear nights, year-round',
    },
    {
      title: 'Sambhar Village & Salt Heritage Tour',
      slug: 'village-and-salt-tour',
      category: 'culture',
      hero: pick(drone, 1) ?? pick(drone),
      gallery: drone.slice(1),
      teaser:
        'Walk the salt pans, the heritage lanes and the British-era railway that shaped this landscape for a thousand years.',
      paras: [
        'Sambhar’s story is written in salt. For centuries the lake has supplied Rajasthan — and the kingdom and British era left behind temples, step-wells, a narrow-gauge salt railway and a town full of quiet history.',
        'Our guided tour takes you through the working salt pans and the village at a gentle pace, with local guides who grew up here.',
      ],
      highlights: [
        'See traditional salt harvesting on the lake bed',
        'Heritage lanes, temples and the British-era salt railway',
        'Led by local guides from nearby villages',
        'Excellent landscape and documentary photography',
      ],
      duration: '2–3 hours',
      bestTime: 'Morning or late afternoon',
    },
  ]
  order = 0
  for (const e of experiences) {
    if (!e.hero) continue
    await payload.create({
      collection: 'experiences',
      data: {
        title: e.title,
        slug: e.slug,
        category: e.category as never,
        teaser: e.teaser,
        description: lexicalFromParagraphs(e.paras) as never,
        heroImage: e.hero,
        gallery: e.gallery.filter(Boolean).map((image) => ({ image })),
        duration: e.duration,
        bestTime: e.bestTime,
        difficulty: 'easy' as never,
        highlights: e.highlights.map((text) => ({ text })),
        order: order++,
      },
    })
  }

  // ── 6. SaltBox menu — all 194 real items ──
  console.log('→ SaltBox menu')
  const catIds = new Map<string, number>()
  let catOrder = 0
  for (const cat of menuData.categories) {
    const doc = await payload.create({
      collection: 'menu-categories',
      data: { title: cat, order: catOrder++ },
    })
    catIds.set(cat, doc.id as number)
  }
  let itemOrder = 0
  for (const item of menuData.items) {
    const category = catIds.get(item.category)
    if (!category) continue
    await payload.create({
      collection: 'menu-items',
      data: {
        name: item.name,
        category,
        price: `₹${item.price}`,
        dietary: item.veg ? (['veg'] as never) : undefined,
        signature: /laal maas|camp sambhar thali|butter chicken/i.test(item.name),
        available: true,
        order: itemOrder++,
      },
    })
  }
  console.log(`   ${menuData.items.length} items in ${menuData.categories.length} categories`)

  // ── 7. Team ──
  console.log('→ Team')
  const teamDoc = await payload.create({
    collection: 'team',
    data: {
      name: 'The Camp Sambhar Family',
      role: 'Your hosts',
      photo: pick(team) ?? undefined,
      bio: lexicalFromParagraphs([
        'Camp Sambhar is run by a small team drawn largely from the villages around the lake. We feel proud to employ nearby villagers — from our naturalists and guides to the kitchen and housekeeping.',
        'Between us we know where the flamingos gather at dawn, which night skies are clearest, and how the salt has shaped this land for a thousand years.',
      ]) as never,
      order: 0,
    },
  })

  // ── 8. Reviews (from TripAdvisor/Google presence) ──
  console.log('→ Reviews')
  const reviews: [string, number, string][] = [
    ['Ananya Sharma', 5, 'A magical place! The tents, the food, the people — everything was perfect. Waking up to flamingos on the salt lake is something I will not forget.'],
    ['Rahul Mehta', 5, 'Waking up to flamingos and ending the day under a sky full of stars. Unforgettable. The stargazing session with the telescopes was the highlight.'],
    ['Devika Iyer', 5, 'Warm hospitality, mindful comfort and experiences that truly connect you to this land. The village and salt tour was fascinating.'],
  ]
  for (const [authorName, rating, text] of reviews) {
    await payload.create({
      collection: 'reviews',
      data: { authorName, rating, text, source: 'google', featured: true, date: '2026-01-15' },
    })
  }

  // ── 9. Pages: About cluster, Sustainability, Policies ──
  console.log('→ Pages')
  const mkPage = async (
    title: string,
    slug: string,
    intro: string,
    heroImage: number | null,
    layout: unknown[],
  ) =>
    payload.create({
      collection: 'pages',
      data: { title, slug, intro, heroImage: heroImage ?? undefined, layout: layout as never, _status: 'published' },
    })

  await mkPage(
    'About Us',
    'about',
    ABOUT.welcome[0],
    pick(drone),
    [
      { blockType: 'textBlock', eyebrow: 'Welcome', heading: ABOUT.welcomeTitle, content: lexicalFromParagraphs(ABOUT.welcome.slice(1)), align: 'left' },
      { blockType: 'textBlock', eyebrow: 'Our story', heading: ABOUT.ideaTitle, content: lexicalRich([{ p: ABOUT.ideaLead }, { ul: ABOUT.idea }]), align: 'left' },
      { blockType: 'textBlock', eyebrow: 'Vision', heading: 'Our Vision', content: lexicalFromParagraphs([ABOUT.vision]), align: 'left' },
      { blockType: 'textBlock', eyebrow: 'Mission', heading: 'Our Mission', content: lexicalRich([{ ul: ABOUT.mission }]), align: 'left' },
      { blockType: 'textBlock', eyebrow: 'Recognition', heading: 'Our Accreditation', content: lexicalRich([{ ul: CONTACT.accreditation }]), align: 'left' },
    ],
  )

  await mkPage(
    'About Sambhar Lake',
    'sambhar-lake',
    "Asia's largest inland salt water lake and a globally recognised Ramsar Wetland.",
    pick(birds, 2) ?? pick(birds),
    [
      {
        blockType: 'textBlock',
        eyebrow: 'The lake',
        heading: 'A Ramsar Wetland of International Importance',
        content: lexicalFromParagraphs([
          "Sambhar Salt Lake is Asia's largest inland salt water lake and a globally recognised Ramsar Wetland — tens of kilometres of white sand, ringed by salt pans that have been worked for centuries.",
          'Every winter, thousands of migratory birds travel here from distant countries, transforming the lake into a vibrant sanctuary of Greater and Lesser Flamingos, pelicans, painted storks, avocets, stilts, spoonbills, gulls, terns, ducks and raptors.',
          'On a full moon night the salt plain looks like a moon land. At sunrise, huge flocks of pink flamingos take flight. It is, quite simply, a fairyland.',
        ]),
        align: 'left',
      },
      {
        blockType: 'stats',
        heading: 'Sambhar at a glance',
        stats: [
          { value: '180°', label: 'Uninterrupted lake views from camp' },
          { value: '100+', label: 'Bird species recorded (Rajasthan Forest Dept.)' },
          { value: '~80 km', label: 'From Jaipur' },
          { value: 'Ramsar', label: 'Wetland of International Importance' },
        ],
      },
    ],
  )

  await mkPage(
    SUSTAINABILITY.title,
    'sustainability',
    SUSTAINABILITY.lead,
    pick(pool),
    [
      { blockType: 'textBlock', eyebrow: 'Travel with purpose', heading: SUSTAINABILITY.lead, content: lexicalFromParagraphs(SUSTAINABILITY.intro), align: 'left' },
      ...SUSTAINABILITY.groups.map((g) => ({
        blockType: 'textBlock',
        heading: g.title,
        content: lexicalRich([{ ul: g.items }]),
        align: 'left',
      })),
      { blockType: 'textBlock', eyebrow: 'Together', heading: 'Guest Responsibility', content: lexicalRich([{ ul: SUSTAINABILITY.guestResponsibility }]), align: 'left' },
      { blockType: 'textBlock', eyebrow: 'CSR', heading: 'Our CSR Commitment', content: lexicalRich([{ ul: SUSTAINABILITY.csr }, { p: SUSTAINABILITY.closing }]), align: 'left' },
    ],
  )

  for (const p of POLICIES) {
    await mkPage(
      p.title,
      p.slug,
      p.intro,
      null,
      p.sections.map((s) => ({
        blockType: 'textBlock',
        heading: s.heading,
        content: lexicalRich([{ ul: s.items }]),
        align: 'left',
      })),
    )
  }

  // ── 10. Gallery albums ──
  console.log('→ Gallery')
  const albums: [string, string, string, number[]][] = [
    ['Birds of Sambhar', 'birds-of-sambhar', 'wildlife', birds],
    ['Swiss Tent Cottages', 'swiss-tent-cottages', 'camp', [...swissExt, ...swissInt]],
    ['Under the Stars', 'under-the-stars', 'astronomy', stars],
    ['SaltBox Restaurant', 'saltbox-restaurant', 'dining', restaurant],
    ['The Pool', 'the-pool', 'camp', pool],
    ['From the Air', 'from-the-air', 'landscape', drone],
    ['Our Kitchen', 'our-kitchen', 'dining', kitchen],
    ['Hiking Tents', 'hiking-tents', 'camp', hiking],
  ]
  let albumOrder = 0
  for (const [title, slug, category, imgs] of albums) {
    const valid = imgs.filter(Boolean)
    if (valid.length === 0) continue
    await payload.create({
      collection: 'gallery-albums',
      data: {
        title,
        slug,
        category: category as never,
        coverImage: valid[0],
        images: valid.map((image) => ({ image })),
        order: albumOrder++,
      },
    })
  }

  // ── 11. Blog — the client's planned SEO topics ──
  console.log('→ Blog')
  const posts: { title: string; slug: string; excerpt: string; cover: number | null; paras: string[] }[] = [
    {
      title: 'Complete Travel Guide to Sambhar Lake',
      slug: 'complete-travel-guide-to-sambhar-lake',
      excerpt: "Everything you need to plan a trip to Asia's largest inland salt lake — when to go, how to get there, and what not to miss.",
      cover: pick(drone),
      paras: [
        "Sambhar Salt Lake sits about 80 km south-west of Jaipur — Asia's largest inland salt water lake, a Ramsar Wetland of International Importance, and still one of Rajasthan's most overlooked destinations.",
        'The best months are the winter migration season, when Greater and Lesser Flamingos arrive in their thousands alongside pelicans, painted storks and dozens of wader species. Mornings are for birding, afternoons for the salt pans and village, and nights for the stars.',
        'Camp Sambhar Resort sits on the edge of the lake at Village Jhapok, with a 180° view of the white salt flats — an easy weekend escape from Jaipur or Delhi.',
      ],
    },
    {
      title: 'Best Time to Visit Sambhar Lake',
      slug: 'best-time-to-visit-sambhar-lake',
      excerpt: 'A season-by-season guide to flamingos, weather and the clearest night skies at Sambhar.',
      cover: pick(birds),
      paras: [
        'Every season tells a different story at Sambhar Lake. The winter migration season is the headline act — thousands of flamingos and migratory birds arriving from distant countries and turning the salt flats into a vibrant sanctuary.',
        'Winter days are mild and the light is superb for photography. Come summer, the lake takes on its stark, shimmering character, and the night skies remain exceptional year-round thanks to very low light pollution.',
        'For birding, plan a sunrise start. For stargazing, any clear night will do — and no two nights are ever the same.',
      ],
    },
    {
      title: 'Why Flamingos Visit Sambhar Lake',
      slug: 'why-flamingos-visit-sambhar-lake',
      excerpt: 'The salt, the algae and the shallow brine that draw thousands of pink flamingos here each year.',
      cover: pick(birds, 1) ?? pick(birds),
      paras: [
        'Flamingos come to Sambhar for the same reason the salt-makers do: the brine. The lake’s shallow, highly saline water supports the algae and tiny crustaceans that flamingos feed on — and which give their feathers that famous pink.',
        'Both Greater and Lesser Flamingos are recorded here, alongside pelicans, spoonbills, avocets and stilts. The Rajasthan Forest Department’s biodiversity survey lists over a hundred species for the lake.',
        'Watching a flock lift off the water at sunrise, with the white salt stretching to the horizon, is the single image most guests take home from Camp Sambhar.',
      ],
    },
    {
      title: 'A Weekend Getaway from Jaipur',
      slug: 'weekend-getaway-from-jaipur',
      excerpt: 'Two nights at the salt lake: birding at dawn, salt heritage by day, telescopes after dark.',
      cover: pick(swissExt),
      paras: [
        'Sambhar is close enough to Jaipur for a genuine weekend — roughly two and a half hours by road — but far enough that the city noise disappears entirely.',
        'A good two-night rhythm: arrive for sunset over the salt flats, spend the first evening stargazing, wake early for the flamingos, take the village and salt-pan tour after breakfast, then leave the second afternoon free for the pool and the restaurant.',
        'Book on 100% payment; our cancellation terms are simple and published in full on the policies page.',
      ],
    },
  ]
  let postDate = new Date('2026-06-01T06:00:00.000Z').getTime()
  for (const post of posts) {
    await payload.create({
      collection: 'blog-posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.cover ?? heroImg,
        author: teamDoc.id,
        body: lexicalFromParagraphs(post.paras) as never,
        publishedAt: new Date(postDate).toISOString(),
        featured: true,
        _status: 'published',
      },
    })
    postDate -= 1000 * 60 * 60 * 24 * 12
  }

  console.log('\n✓ Real-content seed complete.')
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} → /admin`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
