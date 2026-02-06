import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      members: {
        create: {
          clerkUserId: 'test_user_123',
          email: 'test@example.com',
          role: 'ADMIN',
        },
      },
    },
  });

  console.log('✅ Created organization:', org.id);
  console.log('   Name:', org.name);
  console.log('   Slug:', org.slug);

  // Create services
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'API Server',
        description: 'Main application API',
        status: 'OPERATIONAL',
        organizationId: org.id,
        order: 1,
      },
      {
        name: 'Web Application',
        description: 'Frontend web app',
        status: 'OPERATIONAL',
        organizationId: org.id,
        order: 2,
      },
      {
        name: 'Database',
        description: 'PostgreSQL database',
        status: 'DEGRADED_PERFORMANCE',
        organizationId: org.id,
        order: 3,
      },
    ],
  });

  console.log('✅ Created', services.count, 'services');
  
  // Show all created data
  const allServices = await prisma.service.findMany({
    where: { organizationId: org.id },
  });
  
  console.log('\n📋 Created Services:');
  allServices.forEach(s => {
    console.log(`   - ${s.name} (${s.id}) - ${s.status}`);
  });

  console.log('\n✨ Seeding complete!');
  console.log('\n📝 Save this for testing:');
  console.log('   Organization ID:', org.id);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });