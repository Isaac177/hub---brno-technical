const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');

const prisma = new PrismaClient();

// Category IDs from previous seeding
const CATEGORIES = {
  TECHNOLOGY: '5f2ddc68-7b2d-4329-a9aa-6423f22c1ac7',
  EDUCATION: '36115308-6604-4ea5-8651-c798707ba7f4',
  BUSINESS: '6d10469b-2025-4bdd-9541-61dfa258bb4a',
  SCIENCE: 'ad29d1c0-d619-4af1-8368-0f38e5e2b9c2',
  ARTS_CULTURE: '59c2341b-f3bb-41aa-b86a-55f117621524',
  HEALTH_WELLNESS: '7c88117a-0675-4c56-8fe9-d78141ecc627',
  PERSONAL_DEV: '22f6b898-320b-4a94-b64f-e91ea04c690c',
  CAREER: 'ff55bec9-99cb-4824-a959-221fc40102d1',
  PROGRAMMING: '5ad1d04b-1d58-4996-939e-4b610d2fc2e4',
  DATA_SCIENCE: 'cb5cfc59-93c0-40b3-9872-59c6ca46c127'
};

// Tag IDs from previous seeding
const TAGS = {
  STUDY_TIPS: '0ae55fbe-e45d-4b18-9a80-80074fe83753',
  STUDENT_LIFE: '898baa70-a339-4935-8efb-f07269040e26',
  TEACHING: 'db8cd693-a1ed-479c-8312-9a75d0f73319',
  ENTREPRENEURSHIP: 'aca9f3f9-d704-4a6b-be82-38b49fce7305',
  LEADERSHIP: '5292f495-e827-43d9-a599-fe9bf68c9618',
  REMOTE_WORK: 'a710dd6f-9af8-4791-9058-552ff88e1c66',
  CAREER_TIPS: 'a98c2ea5-062e-4562-aeb9-589ec3174893',
  JAVASCRIPT: '234ca529-7320-4038-bc61-e0d73efd2f29',
  PYTHON: '2c378162-1131-406c-98df-a73a02851e62',
  REACT: '06fe187c-252a-41c6-ba32-89e07e29d8d0',
  NODEJS: '5f383600-8de5-4472-89ac-401f912732d7',
  DATABASE: '1fa73f95-9ae1-456c-95a7-e5dad38eb143',
  PRODUCTIVITY: 'db16ce19-2573-4c9a-8452-fa48c855fbce',
  INNOVATION: 'f1e8b621-7514-4b38-ac9e-50e93edf423a',
  BEST_PRACTICES: '26edb082-e2b7-4649-8101-82edf42060d2',
  TUTORIAL: '0a29e201-dcb7-41c2-9467-db777fed7980',
  GUIDE: '909929b4-5cfa-444b-b306-959d294c23cc'
};

// Sample user IDs (you might want to replace these with real user IDs from your user service)
const SAMPLE_USERS = [
  { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'user3', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=3' },
];

// Post type distribution
const POST_TYPES = ['NEWS', 'EVENT', 'DISCUSSION', 'ANNOUNCEMENT'];

// Helper to get random tags based on category
function getRelevantTags(categoryId) {
  switch(categoryId) {
    case CATEGORIES.PROGRAMMING:
      return [TAGS.JAVASCRIPT, TAGS.PYTHON, TAGS.REACT, TAGS.NODEJS, TAGS.TUTORIAL, TAGS.BEST_PRACTICES];
    case CATEGORIES.EDUCATION:
      return [TAGS.STUDY_TIPS, TAGS.STUDENT_LIFE, TAGS.TEACHING, TAGS.GUIDE];
    case CATEGORIES.BUSINESS:
      return [TAGS.ENTREPRENEURSHIP, TAGS.LEADERSHIP, TAGS.INNOVATION];
    case CATEGORIES.CAREER:
      return [TAGS.CAREER_TIPS, TAGS.REMOTE_WORK, TAGS.LEADERSHIP];
    default:
      return [TAGS.GUIDE, TAGS.TUTORIAL, TAGS.BEST_PRACTICES, TAGS.INNOVATION];
  }
}

async function seedPosts() {
  console.log('📝 Starting to seed posts...\n');
  const createdPosts = [];

  try {
    // Create 5 posts for each category
    for (const [categoryName, categoryId] of Object.entries(CATEGORIES)) {
      console.log(`\nCreating posts for category: ${categoryName}`);
      
      for (let i = 0; i < 5; i++) {
        const user = SAMPLE_USERS[Math.floor(Math.random() * SAMPLE_USERS.length)];
        const title = faker.lorem.sentence();
        const isPublished = Math.random() > 0.2; // 80% chance of being published
        
        const post = await prisma.post.create({
          data: {
            title,
            slug: slugify(title.toLowerCase()),
            content: faker.lorem.paragraphs(5),
            type: POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)],
            status: isPublished ? 'PUBLISHED' : 'DRAFT',
            userId: user.id,
            authorName: user.name,
            authorAvatar: user.avatar,
            imageUrl: `https://picsum.photos/seed/${faker.number.int()}/1200/630`,
            categoryId: categoryId,
            publishedAt: isPublished ? faker.date.past() : null,
            tags: {
              connect: faker.helpers.arrayElements(getRelevantTags(categoryId), { min: 2, max: 4 })
                .map(tagId => ({ id: tagId }))
            }
          },
        });

        createdPosts.push(post);
        console.log(`✅ Created post: ${post.title}`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Author: ${post.authorName}\n`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`Total posts created: ${createdPosts.length}`);
    console.log(`Published posts: ${createdPosts.filter(p => p.status === 'PUBLISHED').length}`);
    console.log(`Draft posts: ${createdPosts.filter(p => p.status === 'DRAFT').length}`);
    
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedPosts();
