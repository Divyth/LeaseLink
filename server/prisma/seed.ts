import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient, PropertyType, Role, ListingStatus, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();
const uploadsDir = path.resolve('uploads');
const seedDir = path.join(uploadsDir, 'seed');

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeSvg(label: string, background: string, accent: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${background}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="940" cy="120" r="180" fill="rgba(255,255,255,0.18)"/>
  <circle cx="170" cy="670" r="120" fill="rgba(255,255,255,0.10)"/>
  <text x="80" y="140" font-size="74" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="white">${label}</text>
  <text x="80" y="210" font-size="32" font-family="Arial, Helvetica, sans-serif" fill="rgba(255,255,255,0.88)">FlatBuddy demo image</text>
</svg>`;
}

const campusCenters = {
  USC: { lat: 34.0224, lng: -118.2851 },
  UCLA: { lat: 34.0689, lng: -118.4452 },
  NYU: { lat: 40.7295, lng: -73.9965 },
  Columbia: { lat: 40.8075, lng: -73.9626 },
  'Boston University': { lat: 42.3505, lng: -71.1069 }
} as const;

const password = 'Password123!';

const owners = [
  { name: 'Maya Chen', email: 'maya@flatbuddy.local', university: 'USC', phone: '213-555-0111' },
  { name: 'Jordan Alvarez', email: 'jordan@flatbuddy.local', university: 'NYU', phone: '212-555-0122' }
];

const tenants = [
  { name: 'Avery Patel', email: 'avery@flatbuddy.local', university: 'UCLA', phone: '310-555-0133' },
  { name: 'Noah Kim', email: 'noah@flatbuddy.local', university: 'USC', phone: '323-555-0144' },
  { name: 'Sofia Ramirez', email: 'sofia@flatbuddy.local', university: 'Columbia', phone: '917-555-0155' },
  { name: 'Ethan Brooks', email: 'ethan@flatbuddy.local', university: 'Boston University', phone: '617-555-0166' }
];

const listingSeeds = [
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'USC', title: 'Sunlit 2BR near USC Village', city: 'Los Angeles', state: 'CA', zip: '90007',
    address: '1201 W 37th Pl', rent: 2650, deposit: 2650, bedrooms: 2, bathrooms: 1, areaSqft: 840, propertyType: PropertyType.APARTMENT,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-01'), amenities: ['WiFi', 'Laundry', 'Parking', 'AC', 'Dishwasher'], status: ListingStatus.ACTIVE,
    latitude: 34.0238, longitude: -118.2869, description: 'Bright two-bedroom apartment with easy access to campus shuttles, grocery stores, and coffee shops.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'USC', title: 'Private room in quiet shared house', city: 'Los Angeles', state: 'CA', zip: '90018',
    address: '3410 S Hoover St', rent: 1200, deposit: 1200, bedrooms: 1, bathrooms: 1, areaSqft: 180, propertyType: PropertyType.ROOM,
    leaseTerm: 'Flexible', availableFrom: new Date('2026-07-15'), amenities: ['WiFi', 'Laundry', 'Furnished'], status: ListingStatus.ACTIVE,
    latitude: 34.0193, longitude: -118.2862, description: 'Calm room rental in a student-friendly house with shared kitchen and furnished common spaces.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'UCLA', title: 'Studio with courtyard minutes from UCLA', city: 'Los Angeles', state: 'CA', zip: '90024',
    address: '10900 Ohio Ave', rent: 2195, deposit: 2195, bedrooms: 0, bathrooms: 1, areaSqft: 420, propertyType: PropertyType.STUDIO,
    leaseTerm: '12 months', availableFrom: new Date('2026-09-01'), amenities: ['Pool', 'Gym', 'Laundry', 'AC'], status: ListingStatus.ACTIVE,
    latitude: 34.0592, longitude: -118.4424, description: 'Modern studio with courtyard views, ideal for a focused student schedule.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'UCLA', title: 'Shared 3BR by Westwood', city: 'Los Angeles', state: 'CA', zip: '90024',
    address: '10877 Wilshire Blvd', rent: 1450, deposit: 1450, bedrooms: 3, bathrooms: 2, areaSqft: 980, propertyType: PropertyType.SHARED,
    leaseTerm: '10 months', availableFrom: new Date('2026-08-15'), amenities: ['WiFi', 'Laundry', 'Study Room'], status: ListingStatus.ACTIVE,
    latitude: 34.0647, longitude: -118.4429, description: 'Three-bedroom shared flat with a quiet study nook and a short ride to campus.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'NYU', title: 'Village studio with elevator', city: 'New York', state: 'NY', zip: '10003',
    address: '14 E 4th St', rent: 3150, deposit: 3150, bedrooms: 0, bathrooms: 1, areaSqft: 390, propertyType: PropertyType.STUDIO,
    leaseTerm: '12 months', availableFrom: new Date('2026-07-01'), amenities: ['Elevator', 'Laundry', 'AC', 'Furnished'], status: ListingStatus.ACTIVE,
    latitude: 40.7291, longitude: -73.9928, description: 'Compact studio in the Village with strong transit access and campus convenience.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'NYU', title: '2BR with skyline light', city: 'New York', state: 'NY', zip: '10012',
    address: '225 Sullivan St', rent: 4100, deposit: 4100, bedrooms: 2, bathrooms: 1, areaSqft: 760, propertyType: PropertyType.APARTMENT,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-01'), amenities: ['Dishwasher', 'Laundry', 'Pet Friendly', 'WiFi'], status: ListingStatus.ACTIVE,
    latitude: 40.7298, longitude: -73.9981, description: 'Top-floor apartment with lots of natural light and a clean student share layout.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'Columbia', title: 'Upper Manhattan room with desk setup', city: 'New York', state: 'NY', zip: '10027',
    address: '555 W 125th St', rent: 1450, deposit: 1450, bedrooms: 1, bathrooms: 1, areaSqft: 210, propertyType: PropertyType.ROOM,
    leaseTerm: 'Spring', availableFrom: new Date('2026-07-10'), amenities: ['WiFi', 'Furnished', 'Laundry'], status: ListingStatus.ACTIVE,
    latitude: 40.8082, longitude: -73.9609, description: 'Private room in a building with quiet study space and easy subway access.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'Columbia', title: 'Studio near Morningside Park', city: 'New York', state: 'NY', zip: '10027',
    address: '336 W 106th St', rent: 2350, deposit: 2350, bedrooms: 0, bathrooms: 1, areaSqft: 430, propertyType: PropertyType.STUDIO,
    leaseTerm: '12 months', availableFrom: new Date('2026-09-01'), amenities: ['AC', 'Laundry', 'Dishwasher'], status: ListingStatus.ACTIVE,
    latitude: 40.8055, longitude: -73.9640, description: 'Quiet studio close to campus, parks, and grocery options.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'Boston University', title: 'Fenway 2BR with student lease', city: 'Boston', state: 'MA', zip: '02215',
    address: '40 Babcock St', rent: 3200, deposit: 3200, bedrooms: 2, bathrooms: 1, areaSqft: 700, propertyType: PropertyType.APARTMENT,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-01'), amenities: ['Laundry', 'Dishwasher', 'Gym', 'Study Room'], status: ListingStatus.ACTIVE,
    latitude: 42.3479, longitude: -71.1063, description: 'Well-kept apartment with a practical layout for roommates and a short walk to campus.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'Boston University', title: 'Shared brownstone room', city: 'Boston', state: 'MA', zip: '02215',
    address: '71 Saint Marys St', rent: 1350, deposit: 1350, bedrooms: 1, bathrooms: 1, areaSqft: 190, propertyType: PropertyType.ROOM,
    leaseTerm: 'Academic year', availableFrom: new Date('2026-07-20'), amenities: ['Furnished', 'WiFi', 'Laundry'], status: ListingStatus.ACTIVE,
    latitude: 42.3496, longitude: -71.1082, description: 'Bright room in a student house with a friendly shared kitchen.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'USC', title: 'Rented 1BR for archive browsing', city: 'Los Angeles', state: 'CA', zip: '90007',
    address: '1123 W 30th St', rent: 2100, deposit: 2100, bedrooms: 1, bathrooms: 1, areaSqft: 560, propertyType: PropertyType.APARTMENT,
    leaseTerm: '12 months', availableFrom: new Date('2026-06-01'), amenities: ['AC', 'Parking', 'Laundry'], status: ListingStatus.RENTED,
    latitude: 34.0302, longitude: -118.2877, description: 'Compact apartment with a classic student setup.',
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'NYU', title: 'Paused loft-style room', city: 'New York', state: 'NY', zip: '10003',
    address: '88 E 10th St', rent: 1800, deposit: 1800, bedrooms: 1, bathrooms: 1, areaSqft: 250, propertyType: PropertyType.ROOM,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-10'), amenities: ['Furnished', 'Laundry'], status: ListingStatus.PAUSED,
    latitude: 40.7312, longitude: -73.9898, description: 'Loft-style room with a good layout and natural light.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'Columbia', title: 'West Harlem 3BR for roommates', city: 'New York', state: 'NY', zip: '10031',
    address: '620 W 138th St', rent: 2950, deposit: 2950, bedrooms: 3, bathrooms: 2, areaSqft: 950, propertyType: PropertyType.APARTMENT,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-01'), amenities: ['WiFi', 'Laundry', 'Dishwasher'], status: ListingStatus.ACTIVE,
    latitude: 40.8167, longitude: -73.9551, description: 'Roommate-friendly apartment with a practical commute to campus.'
  },
  {
    ownerEmail: 'maya@flatbuddy.local', campus: 'UCLA', title: 'Westwood shared flat with balcony', city: 'Los Angeles', state: 'CA', zip: '90024',
    address: '10930 Ophir Dr', rent: 1550, deposit: 1550, bedrooms: 2, bathrooms: 2, areaSqft: 830, propertyType: PropertyType.SHARED,
    leaseTerm: '12 months', availableFrom: new Date('2026-08-20'), amenities: ['Balcony', 'Laundry', 'Gym', 'WiFi'], status: ListingStatus.ACTIVE,
    latitude: 34.0618, longitude: -118.4445, description: 'Shared apartment with outdoor space and a reliable student commute.'
  },
  {
    ownerEmail: 'jordan@flatbuddy.local', campus: 'Boston University', title: 'South End studio', city: 'Boston', state: 'MA', zip: '02115',
    address: '118 Hemenway St', rent: 2280, deposit: 2280, bedrooms: 0, bathrooms: 1, areaSqft: 410, propertyType: PropertyType.STUDIO,
    leaseTerm: '12 months', availableFrom: new Date('2026-09-01'), amenities: ['AC', 'Elevator', 'Laundry'], status: ListingStatus.ACTIVE,
    latitude: 42.3447, longitude: -71.0908, description: 'Efficient studio near transit and campus life.'
  }
];

async function main() {
  ensureDir(seedDir);

  const imageFiles = [
    ['usc-a.svg', makeSvg('FlatBuddy USC', '#0f172a', '#ef4444')],
    ['usc-b.svg', makeSvg('USC Room', '#111827', '#f97316')],
    ['ucla-a.svg', makeSvg('FlatBuddy UCLA', '#1d4ed8', '#0f766e')],
    ['ucla-b.svg', makeSvg('UCLA Shared', '#172554', '#2563eb')],
    ['nyu-a.svg', makeSvg('FlatBuddy NYU', '#4f46e5', '#0f172a')],
    ['nyu-b.svg', makeSvg('NYU Studio', '#111827', '#7c3aed')],
    ['columbia-a.svg', makeSvg('Columbia Home', '#0f172a', '#334155')],
    ['columbia-b.svg', makeSvg('Columbia Room', '#1e293b', '#475569')],
    ['bu-a.svg', makeSvg('BU Place', '#7c2d12', '#ea580c')],
    ['bu-b.svg', makeSvg('BU Studio', '#4c1d95', '#1d4ed8')]
  ] as const;

  for (const [name, content] of imageFiles) {
    fs.writeFileSync(path.join(seedDir, name), content);
  }

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'FlatBuddy Admin',
      email: 'admin@flatbuddy.local',
      passwordHash: hashed,
      role: Role.ADMIN,
      university: 'FlatBuddy'
    }
  });

  const createdOwners = [];
  for (const owner of owners) {
    createdOwners.push(await prisma.user.create({
      data: {
        ...owner,
        passwordHash: hashed,
        role: Role.OWNER
      }
    }));
  }

  const createdTenants = [];
  for (const tenant of tenants) {
    createdTenants.push(await prisma.user.create({
      data: {
        ...tenant,
        passwordHash: hashed,
        role: Role.TENANT
      }
    }));
  }

  const listings = [];
  for (const [index, seed] of listingSeeds.entries()) {
    const owner = createdOwners.find((item) => item.email === seed.ownerEmail);
    if (!owner) continue;
    const listing = await prisma.listing.create({
      data: {
        ownerId: owner.id,
        title: seed.title,
        description: seed.description,
        address: seed.address,
        city: seed.city,
        state: seed.state,
        zip: seed.zip,
        latitude: seed.latitude,
        longitude: seed.longitude,
        rent: seed.rent,
        deposit: seed.deposit,
        bedrooms: seed.bedrooms,
        bathrooms: seed.bathrooms,
        areaSqft: seed.areaSqft,
        propertyType: seed.propertyType,
        leaseTerm: seed.leaseTerm,
        availableFrom: seed.availableFrom,
        amenities: seed.amenities,
        status: seed.status
      }
    });
    listings.push(listing);

    const imageName = imageFiles[index % imageFiles.length][0];
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        filename: imageName,
        url: `/uploads/seed/${imageName}`
      }
    });
    if (index % 3 === 0) {
      const secondImage = imageFiles[(index + 1) % imageFiles.length][0];
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          filename: secondImage,
          url: `/uploads/seed/${secondImage}`
        }
      });
    }
  }

  const favoritesData = [
    { user: createdTenants[0], listing: listings[0] },
    { user: createdTenants[0], listing: listings[2] },
    { user: createdTenants[1], listing: listings[4] },
    { user: createdTenants[2], listing: listings[7] },
    { user: createdTenants[3], listing: listings[8] }
  ];

  for (const item of favoritesData) {
    if (!item.user || !item.listing) continue;
    await prisma.favorite.create({ data: { userId: item.user.id, listingId: item.listing.id } });
  }

  const conversations: Array<{ listingIndex: number; tenantIndex: number }> = [
    { listingIndex: 0, tenantIndex: 0 },
    { listingIndex: 2, tenantIndex: 1 },
    { listingIndex: 4, tenantIndex: 2 },
    { listingIndex: 7, tenantIndex: 3 },
    { listingIndex: 8, tenantIndex: 0 }
  ];

  const createdConversations = [];
  for (const item of conversations) {
    const listing = listings[item.listingIndex];
    const tenant = createdTenants[item.tenantIndex];
    if (!listing || !tenant) continue;
    const owner = createdOwners.find((o) => o.id === listing.ownerId)!;
    const conversation = await prisma.conversation.create({
      data: {
        listingId: listing.id,
        tenantId: tenant.id,
        ownerId: owner.id
      }
    });
    createdConversations.push(conversation);
  }

  const messageBodies = [
    'Hi, is this still available for August move-in?',
    'Yes, it is available. Would you like to schedule a tour?',
    'That works for me. How close is it to campus?',
    'About a 7 minute walk. I can send the full details.',
    'Can we do Friday afternoon?',
    'Friday at 3pm is open. I will mark it down.',
    'Thanks, I will confirm after class.',
    'Perfect, I have your contact saved.',
    'Is the rent negotiable for a 2-person lease?',
    'I can offer a small discount for a 12 month lease.'
  ];

  for (const [index, conversation] of createdConversations.entries()) {
    const tenant = createdTenants[conversations[index].tenantIndex];
    const owner = createdOwners.find((o) => o.id === conversation.ownerId)!;
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, senderId: tenant.id, body: messageBodies[index * 2] },
        { conversationId: conversation.id, senderId: owner.id, body: messageBodies[index * 2 + 1] }
      ]
    });
  }

  const appointments = [
    { listing: listings[0], tenant: createdTenants[0], status: AppointmentStatus.REQUESTED },
    { listing: listings[2], tenant: createdTenants[1], status: AppointmentStatus.CONFIRMED },
    { listing: listings[4], tenant: createdTenants[2], status: AppointmentStatus.DECLINED },
    { listing: listings[7], tenant: createdTenants[3], status: AppointmentStatus.REQUESTED },
    { listing: listings[8], tenant: createdTenants[0], status: AppointmentStatus.CANCELLED }
  ];

  for (const item of appointments) {
    if (!item.listing || !item.tenant) continue;
    const owner = createdOwners.find((o) => o.id === item.listing.ownerId)!;
    await prisma.appointment.create({
      data: {
        listingId: item.listing.id,
        tenantId: item.tenant.id,
        ownerId: owner.id,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        note: 'Interested in a quick afternoon visit.',
        status: item.status
      }
    });
  }

  console.log(`Seeded FlatBuddy with ${createdOwners.length} owners, ${createdTenants.length} tenants, ${listings.length} listings, and demo data.`);
  console.log(`Demo credentials use password: ${password}`);
  console.log(`Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
