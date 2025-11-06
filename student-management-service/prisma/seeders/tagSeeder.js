const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function seedTags() {
  const tags = [
    // Technology related
    'Web Development', 'Mobile Apps', 'AI', 'Machine Learning', 'Cloud Computing',
    // Education related
    'Online Learning', 'Study Tips', 'Student Life', 'Teaching Methods',
    // Business & Career
    'Entrepreneurship', 'Leadership', 'Remote Work', 'Career Tips',
    // Programming
    'JavaScript', 'Python', 'React', 'Node.js', 'Database',
    // General
    'Productivity', 'Innovation', 'Best Practices', 'Tutorial', 'Guide'
  ];

  console.log('🏷️  Starting to seed tags...\n');
  const createdTags = [];

  try {
    for (const tagName of tags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          slug: slugify(tagName.toLowerCase()),
          description: faker.lorem.sentence(),
        },
      });
      createdTags.push(tag);
      console.log(`✅ Created tag: ${tag.name}`);
      console.log(`   ID: ${tag.id}`);
      console.log(`   Slug: ${tag.slug}\n`);
    }

    console.log('\n📋 Tag IDs for reference (save these for post seeder):');
    console.log('------------------------------------------------');
    createdTags.forEach(tag => {
      console.log(`${tag.name}: ${tag.id}`);
    });
    console.log('------------------------------------------------\n');
    
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTags();
