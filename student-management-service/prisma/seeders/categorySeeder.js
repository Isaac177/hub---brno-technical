const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = [
    'Technology',
    'Education',
    'Business',
    'Science',
    'Arts & Culture',
    'Health & Wellness',
    'Personal Development',
    'Career Guidance',
    'Programming',
    'Data Science'
  ];

  console.log('🌱 Starting to seed categories...\n');
  const createdCategories = [];

  try {
    for (const categoryName of categories) {
      const category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slugify(categoryName.toLowerCase()),
          description: faker.lorem.paragraph(),
        },
      });
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Slug: ${category.slug}\n`);
    }

    console.log('\n📋 Category IDs for reference (save these for next seeders):');
    console.log('------------------------------------------------');
    createdCategories.forEach(cat => {
      console.log(`${cat.name}: ${cat.id}`);
    });
    console.log('------------------------------------------------\n');
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
