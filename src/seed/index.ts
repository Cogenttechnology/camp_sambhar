import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { placeholderImage } from './placeholder'
import { lexicalFromParagraphs } from './lexical'

// ── Minimal .env loader (no dependency) ──
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

const ADMIN_EMAIL = 'admin@campsambhar.com'
const ADMIN_PASSWORD = 'ChangeMe123!'

async function run() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const ASSETS = path.resolve(process.cwd(), 'Camp-Sambhar-Website-Assets')

  const sharp = (await import('sharp')).default

  /** Upload a real photo from the asset pack (falls back to a placeholder if missing).
   *  Photos are normalized to clean JPEGs via sharp to avoid libpng edge cases and
   *  to keep file sizes web-friendly. The logo keeps transparency (PNG). */
  const uploadPhoto = async (relPath: string, alt: string, fallbackVariant = 'landscape') => {
    const abs = path.join(ASSETS, relPath)
    const isLogo = /logo/i.test(relPath)
    let buffer: Buffer
    let name: string
    if (fs.existsSync(abs)) {
      const raw = fs.readFileSync(abs)
      if (isLogo) {
        buffer = await sharp(raw, { failOn: 'none' }).png().toBuffer()
        name = 'camp-sambhar-logo.png'
      } else {
        buffer = await sharp(raw, { failOn: 'none' })
          .rotate()
          .resize({ width: 2000, withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer()
        name = path.basename(relPath).replace(/\.[a-z]+$/i, '.jpg')
      }
    } else {
      buffer = await placeholderImage(alt.slice(0, 24), fallbackVariant as never)
      name = `${alt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.jpg`
    }
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        name,
        mimetype: isLogo ? 'image/png' : 'image/jpeg',
        size: buffer.length,
      },
    })
    return doc.id
  }

  console.log('→ Admin user…')
  const existingUsers = await payload.find({ collection: 'users', limit: 1 })
  if (existingUsers.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Camp Sambhar Admin' },
    })
    console.log(`  created ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  } else {
    console.log('  users already exist, skipping')
  }

  console.log('→ Media (real photography)…')
  const P = '01-Photography'
  const heroImg = await uploadPhoto(`${P}/01-homepage-hero-sambhar-sunrise.png`, 'Luxury tents along Sambhar Lake at sunrise, with flamingos on the water', 'landscape')
  const tentVerandaImg = await uploadPhoto(`${P}/02-luxury-tent-veranda.png`, 'Private veranda of a luxury tent overlooking the salt lake', 'camp')
  const birdDetailImg = await uploadPhoto(`${P}/03-birdwatching-binoculars-detail.png`, 'Binoculars resting on a guide’s field notes at dawn', 'wildlife')
  const saltWalkImg = await uploadPhoto(`${P}/04-salt-lake-walking.png`, 'A guest walking across the white salt flats of Sambhar', 'landscape')
  const tentInteriorImg = await uploadPhoto(`${P}/05-luxury-tent-interior.png`, 'Interior of a luxury tent with hand-woven textiles and soft light', 'camp')
  const cottageImg = await uploadPhoto(`${P}/06-family-cottage.png`, 'A rustic family cottage inspired by Rajasthani craft', 'camp')
  const lakeRoomImg = await uploadPhoto(`${P}/07-lake-view-room.png`, 'A lake-view room opening onto the salt flats', 'camp')
  const flamingoImg = await uploadPhoto(`${P}/08-flamingo-birdwatching.png`, 'Flamingos wading in Sambhar Lake at dawn', 'wildlife')
  const villageImg = await uploadPhoto(`${P}/09-sambhar-village-tour.png`, 'A heritage lane on the Sambhar village tour', 'people')
  const saltImg = await uploadPhoto(`${P}/10-salt-making-process.png`, 'Traditional salt harvesting on the Sambhar lake bed', 'landscape')
  const starsImg = await uploadPhoto(`${P}/11-professional-stargazing.png`, 'Professional stargazing under the dark desert sky at Camp Sambhar', 'astronomy')
  const diningImg = await uploadPhoto(`${P}/12-saltbox-cafe-bonfire-dining.png`, 'Bonfire dining under the stars at the Saltbox Café', 'dining')
  const tentBannerImg = await uploadPhoto(`${P}/13-tent-under-stars-banner.png`, 'A lit tent beneath a sky full of stars', 'astronomy')
  const guestFamilyImg = await uploadPhoto(`${P}/14-guest-family-group.png`, 'A family enjoying their stay at Camp Sambhar', 'people')
  const sunsetGuestsImg = await uploadPhoto(`${P}/15-guests-watching-sunset.png`, 'Guests watching the sunset over the salt lake', 'people')
  const journalBirdImg = await uploadPhoto(`${P}/16-journal-birding-morning.png`, 'A wader at the water’s edge on a birding morning', 'wildlife')
  const journalSaltImg = await uploadPhoto(`${P}/17-journal-salt-landscape.png`, 'The vast salt landscape of Sambhar Lake', 'landscape')
  const logo = await uploadPhoto('06-Brand/camp-sambhar-official-logo.png', 'Camp Sambhar official logo')

  console.log('→ Site settings…')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Camp Sambhar',
      tagline: 'A nature escape on the salt lake.',
      logo,
      phone: '+91 90000 00000',
      whatsappNumber: '919000000000',
      email: 'reservations@campsambhar.com',
      address: 'Camp Sambhar, Sambhar Lake\nJaipur District, Rajasthan 303604',
      businessHours: 'Saltbox Café open 7:00 AM – 10:30 PM',
      mapLat: 26.9167,
      mapLng: 75.0833,
      directions: 'About 80 km southwest of Jaipur, on the shores of Sambhar Salt Lake.',
      priceRange: '₹₹₹',
      defaultMetaDescription:
        'An eco, rustic-luxury desert camping resort at Sambhar Lake, Rajasthan — flamingos, dark-sky stargazing, salt-lake heritage, and the Saltbox Café.',
      defaultOgImage: heroImg,
      socials: [
        { platform: 'Instagram', url: 'https://instagram.com/' },
        { platform: 'Facebook', url: 'https://facebook.com/' },
      ],
    },
  })

  console.log('→ Rooms…')
  const rooms = [
    {
      title: 'Luxury Salt-View Tent',
      category: 'luxury-tent',
      heroImage: tentInteriorImg,
      galleryImgs: [tentVerandaImg, tentBannerImg],
      priceFrom: 8500,
      short: 'Canvas-and-timber tents that open straight onto the salt flats, with hand-woven textiles and a private deck.',
      maxAdults: 2,
      sizeSqft: 420,
    },
    {
      title: 'Aravalli Cottage',
      category: 'cottage',
      heroImage: cottageImg,
      galleryImgs: [lakeRoomImg, sunsetGuestsImg],
      priceFrom: 11500,
      short: 'Mud-plastered cottages inspired by Rajasthani craft, cool by day and lantern-lit by night.',
      maxAdults: 3,
      sizeSqft: 560,
    },
    {
      title: 'Lake-View Room',
      category: 'suite',
      heroImage: lakeRoomImg,
      galleryImgs: [tentVerandaImg, sunsetGuestsImg],
      priceFrom: 13500,
      short: 'Wake to water, light, and birdsong in a calm room that opens straight onto the salt lake.',
      maxAdults: 4,
      sizeSqft: 640,
    },
  ]
  let order = 0
  for (const r of rooms) {
    await payload.create({
      collection: 'rooms',
      data: {
        title: r.title,
        slug: r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: r.category as never,
        shortDescription: r.short,
        description: lexicalFromParagraphs([
          `The ${r.title} is designed to disappear into the landscape — natural materials, soft light, and uninterrupted views of the salt lake.`,
          'Each stay includes breakfast at the Saltbox Café, guided access to our experiences, and evenings under some of the darkest skies in the region.',
        ]) as never,
        heroImage: r.heroImage,
        gallery: r.galleryImgs.map((image) => ({ image })),
        maxAdults: r.maxAdults,
        sizeSqft: r.sizeSqft,
        priceFrom: r.priceFrom,
        amenities: [
          { label: 'Private deck' },
          { label: 'Ensuite bathroom' },
          { label: 'Organic toiletries' },
          { label: 'Stargazing chairs' },
        ],
        order: order++,
      },
    })
  }

  console.log('→ Experiences…')
  const experiences = [
    {
      title: 'Flamingo Bird Watching',
      category: 'nature',
      hero: flamingoImg,
      galleryImgs: [birdDetailImg, journalBirdImg],
      teaser: 'Walk the shoreline at first light as thousands of flamingos and migratory birds gather on the lake.',
      bestTime: 'November – February, early morning',
      duration: '2–3 hours',
    },
    {
      title: 'Professional Stargazing',
      category: 'astronomy',
      hero: starsImg,
      galleryImgs: [tentBannerImg, diningImg],
      teaser: 'Under near-zero light pollution, trace constellations and deep-sky objects with our telescopes and astronomer guides.',
      bestTime: 'Clear nights, year-round',
      duration: '1.5–2 hours',
    },
    {
      title: 'Sambhar Salt-Making Visit',
      category: 'culture',
      hero: saltImg,
      galleryImgs: [saltWalkImg, journalSaltImg],
      teaser: 'See how salt has been harvested here for centuries — from brine pans to the crystals on your table.',
      bestTime: 'Morning',
      duration: '2 hours',
    },
    {
      title: 'Sambhar Village Tour',
      category: 'culture',
      hero: villageImg,
      galleryImgs: [sunsetGuestsImg, guestFamilyImg],
      teaser: 'Wander heritage lanes, the ancient temples, and the narrow-gauge salt railway with a local storyteller.',
      bestTime: 'Late afternoon',
      duration: '3 hours',
    },
  ]
  order = 0
  for (const e of experiences) {
    await payload.create({
      collection: 'experiences',
      data: {
        title: e.title,
        slug: e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: e.category as never,
        teaser: e.teaser,
        description: lexicalFromParagraphs([
          `${e.title} is one of the signature experiences at Camp Sambhar, led by guides who know this landscape intimately.`,
          'We keep groups small and unhurried, so there is time to simply watch, listen, and take it in.',
        ]) as never,
        heroImage: e.hero,
        gallery: e.galleryImgs.map((image) => ({ image })),
        duration: e.duration,
        bestTime: e.bestTime,
        difficulty: 'easy' as never,
        highlights: [
          { text: 'Small groups, local guides' },
          { text: 'Included with your stay' },
        ],
        order: order++,
      },
    })
  }

  console.log('→ Café menu…')
  const cat = async (title: string, description: string, o: number) =>
    (await payload.create({ collection: 'menu-categories', data: { title, description, order: o } })).id
  const smallPlates = await cat('Small Plates', 'Salt-cured and slow-cooked, made to share.', 0)
  const mains = await cat('Mains', 'Rooted in Rajasthani kitchens, cooked over wood fire.', 1)
  const desserts = await cat('Desserts', 'Sweet endings under the stars.', 2)

  const items: [string, string, number, number, boolean][] = [
    ['Salt-Roasted Beetroot', 'With hung curd, toasted seeds and desert honey.', smallPlates, 0, true],
    ['Ker Sangri Croquettes', 'A crisp take on the classic desert bean and berry.', smallPlates, 1, false],
    ['Laal Maas', 'Slow-cooked heritage red mutton curry, our signature.', mains, 0, true],
    ['Panchmel Dal & Bati', 'Five-lentil dal with wood-fired baati and ghee.', mains, 1, false],
    ['Rabri Malpua', 'Warm malpua with saffron rabri.', desserts, 0, true],
  ]
  order = 0
  for (const [name, description, category, o, signature] of items) {
    await payload.create({
      collection: 'menu-items',
      data: { name, description, category, price: `₹${350 + o * 120}`, signature, available: true, order: o },
    })
  }

  console.log('→ Reviews…')
  const reviews = [
    ['Ananya R.', 5, 'The stargazing night was unforgettable — the guides made the whole sky come alive. Waking to flamingos was magic.'],
    ['Vikram S.', 5, 'Rustic but genuinely luxurious. The Laal Maas at Saltbox is worth the drive from Jaipur alone.'],
    ['Meera & Family', 5, 'Our kids loved the salt-making visit and the village tour. Warm, thoughtful hosts.'],
  ]
  for (const [authorName, rating, text] of reviews) {
    await payload.create({
      collection: 'reviews',
      data: { authorName: authorName as string, rating: rating as number, text: text as string, source: 'google', featured: true, date: '2026-01-15' },
    })
  }

  console.log('→ Team…')
  const founder = await payload.create({
    collection: 'team',
    data: {
      name: 'Rohan Mehta',
      role: 'Founder & Host',
      photo: guestFamilyImg,
      bio: lexicalFromParagraphs(['Rohan grew up between Jaipur and the salt lake, and built Camp Sambhar to share a landscape most travellers never see.']) as never,
      order: 0,
    },
  })

  console.log('→ Blog…')
  const posts: { title: string; slug: string; excerpt: string; cover: number; paras: string[]; date: string }[] = [
    {
      title: 'A Birder’s Morning at Sambhar',
      slug: 'best-time-to-see-flamingos-sambhar-lake',
      excerpt: 'A month-by-month guide to flamingo season on India’s largest inland salt lake.',
      cover: journalBirdImg,
      date: '2026-01-10T06:00:00.000Z',
      paras: [
        'Every winter, Sambhar Lake becomes one of India’s great flamingo grounds. From November to February, thousands gather on the shallow brine to feed.',
        'For the best sightings, come early — the birds are most active in the soft light just after sunrise, when the lake is still and mirror-flat.',
      ],
    },
    {
      title: 'How Salt Shapes This Land',
      slug: 'how-salt-shapes-this-land',
      excerpt: 'From ancient brine pans to the crystals on your table — the story of Sambhar’s salt.',
      cover: journalSaltImg,
      date: '2026-01-04T06:00:00.000Z',
      paras: [
        'Salt has been harvested at Sambhar for over a thousand years, shaping not just the landscape but the lives and railways of the towns around it.',
        'On the salt-making visit, you can follow the whole journey — from the shimmering evaporation pans to the neat white mounds waiting to travel.',
      ],
    },
    {
      title: 'Your First Night Under the Milky Way',
      slug: 'first-night-under-the-milky-way',
      excerpt: 'What to expect from a night of stargazing at one of India’s darkest skies.',
      cover: tentBannerImg,
      date: '2025-12-20T06:00:00.000Z',
      paras: [
        'With almost no light pollution for miles, Sambhar’s night sky is astonishing. On a clear night, the Milky Way arcs clean across the horizon.',
        'Our astronomer guides set up telescopes after dinner, tracing constellations and deep-sky objects while the bonfire keeps the desert chill away.',
      ],
    },
  ]
  for (const post of posts) {
    await payload.create({
      collection: 'blog-posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.cover,
        author: founder.id,
        body: lexicalFromParagraphs(post.paras) as never,
        publishedAt: post.date,
        featured: true,
        _status: 'published',
      },
    })
  }

  console.log('→ About pages…')
  const pages: [string, string, string][] = [
    ['About Us', 'about', 'A small, family-run camp on the shores of Sambhar Salt Lake.'],
    ['About Sambhar Lake', 'sambhar-lake', 'India’s largest inland salt lake — a landscape of flamingos, salt pans, and enormous skies.'],
    ['Sustainable & Eco Tourism', 'eco-tourism', 'How we tread lightly on a fragile, beautiful place.'],
    ['CSR & Community', 'csr', 'Working with the people of Sambhar town.'],
  ]
  for (const [title, slug, intro] of pages) {
    await payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        intro,
        heroImage: slug === 'sambhar-lake' ? heroImg : slug === 'eco-tourism' ? saltImg : villageImg,
        layout: [
          {
            blockType: 'textBlock',
            eyebrow: 'Camp Sambhar',
            heading: title,
            content: lexicalFromParagraphs([
              `${intro} This page is fully editable in the admin panel — staff can add sections, images, and text without any code.`,
            ]) as never,
            align: 'left',
          },
        ],
        _status: 'published',
      },
    })
  }

  console.log('→ Gallery…')
  await payload.create({
    collection: 'gallery-albums',
    data: {
      title: 'The Salt Lake',
      slug: 'the-salt-lake',
      category: 'landscape',
      coverImage: heroImg,
      images: [
        { image: heroImg, caption: 'Sunrise on the salt pans' },
        { image: saltImg, caption: 'Salt harvest' },
        { image: flamingoImg, caption: 'Flamingos at dawn' },
        { image: saltWalkImg, caption: 'Walking the white flats' },
        { image: journalSaltImg, caption: 'The vast salt landscape' },
      ],
      order: 0,
    },
  })
  await payload.create({
    collection: 'gallery-albums',
    data: {
      title: 'Under the Stars',
      slug: 'under-the-stars',
      category: 'astronomy',
      coverImage: tentBannerImg,
      images: [
        { image: starsImg, caption: 'Stargazing under a dark sky' },
        { image: tentBannerImg, caption: 'A tent beneath the stars' },
        { image: diningImg, caption: 'Bonfire dining' },
      ],
      order: 1,
    },
  })
  await payload.create({
    collection: 'gallery-albums',
    data: {
      title: 'Camp & Guests',
      slug: 'camp-and-guests',
      category: 'camp',
      coverImage: tentVerandaImg,
      images: [
        { image: tentInteriorImg, caption: 'Inside a luxury tent' },
        { image: tentVerandaImg, caption: 'A private veranda' },
        { image: cottageImg, caption: 'A family cottage' },
        { image: sunsetGuestsImg, caption: 'Guests at sunset' },
        { image: guestFamilyImg, caption: 'Family time at camp' },
      ],
      order: 2,
    },
  })

  console.log('\n✓ Seed complete.')
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}  →  /admin`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
