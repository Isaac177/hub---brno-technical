const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Sample users (same as in postSeeder.js)
const SAMPLE_USERS = [
  { id: 'user1', name: 'John Doe' },
  { id: 'user2', name: 'Jane Smith' },
  { id: 'user3', name: 'Alex Johnson' },
  { id: 'user4', name: 'Sarah Wilson' },
  { id: 'user5', name: 'Mike Brown' },
  { id: 'user6', name: 'Emily Davis' },
  { id: 'user7', name: 'Chris Taylor' },
  { id: 'user8', name: 'Lisa Anderson' },
  { id: 'user9', name: 'David Martin' },
  { id: 'user10', name: 'Rachel White' },
];

// Published post IDs from previous seeding
const PUBLISHED_POST_IDS = [
  'cbb59a27-1a7c-4508-987b-57aef4a7b9d4',
  '9e651a60-74f3-4172-805f-e0c0372c8123',
  '07035079-b86e-4b2e-91f5-8fbaa5de8fee',
  '0159f07c-bfac-4062-98e3-6f0991dea2fc',
  'defac524-ceb2-4a58-b370-65b158195670',
  '40f17d11-fb28-4905-a2a7-91cb1da06a14',
  '41b0ca06-8d85-4e62-b1a9-dcf3b8ae73cb',
  'c2c8d106-6d53-49f3-a0b8-9bea512a0ea0',
  '4a1a87af-bd33-42fa-a0a2-212a66965595',
  'a75d373c-4bbf-44dd-955c-84c0cd121736',
  'abd94229-6754-48c1-9092-02e5dbc889c3',
  '6e3e793e-749b-48ec-9ade-be7ea0e1655e',
  '7190d013-ddcb-4e04-866a-b30823592729',
  'cbacbf36-a343-41a3-b95e-009bfe5fdf58',
  '676d89c4-619a-4c70-a305-4cfaffc57683',
  '1e3782c7-6205-4fd4-83b1-125bea0eac48',
  'f93a2008-f89f-44b5-a0c7-592251e5c763',
  '9c19a7d4-bbd1-44f3-881d-9c15a63e725f',
  'd65a7f63-cb5c-4ebf-bf90-3158f93671de',
  'b483a472-c4b0-46fc-aad6-a49ddea1d6a8',
  'eec77649-58aa-40b5-ae30-878a4e1fec4f',
  'fd6705c5-4baa-4570-82c2-0254e95964cc',
  'b22ed98f-5ed8-419c-8dbc-081077120efe',
  '07fe368e-f6cc-4198-93f4-87be2c555fcd',
  '05743efb-6adf-412e-b0f5-0310d078a8ec',
  '2d84bee4-20e7-4597-a03a-dad78fcc1c0b',
  '313967d3-7ab0-49c9-9a27-90fbd63b31da',
  '4215cd5d-17bb-4035-a9f0-765fab0ae798',
  '2ed865a4-b27a-41f7-b5cb-89a94ec84719',
  '06ad1395-45eb-45cc-aa78-6212eef86d65',
  '37d40ef9-eae3-4f04-ba0a-660b9a77d7c8',
  '0653129c-eddb-4b02-9cb8-accf90d94283',
  '36122df5-1e77-4aa7-aa1f-ff4cb1a7c33a',
  '805936e6-d149-44fa-9222-7a6267cc989b',
  'bba2b346-8489-4501-a1c3-fe276011e98b',
  '693e9e52-db74-4fba-a296-4d1e5d117021',
  'b11da05f-108e-4d4d-bc6d-0757ddbfa893',
  '22961953-06b4-42f4-b581-ea43cfacda7d'
];

async function seedViews() {
  console.log('👀 Starting to seed views...\n');
  const createdViews = [];

  try {
    // Create views for each published post
    for (const postId of PUBLISHED_POST_IDS) {
      // Generate between 10 and 50 views for each post
      const viewCount = faker.number.int({ min: 10, max: 50 });
      const viewers = faker.helpers.arrayElements(SAMPLE_USERS, viewCount);

      for (const user of viewers) {
        const visitCount = faker.number.int({ min: 1, max: 5 });
        const firstViewedAt = faker.date.past();
        
        const view = await prisma.view.create({
          data: {
            postId,
            userId: user.id,
            visitCount,
            firstViewedAt,
            lastViewedAt: faker.date.between({ 
              from: firstViewedAt, 
              to: new Date() 
            })
          }
        });
        
        createdViews.push(view);
      }
      
      console.log(`✅ Created ${viewCount} views for post: ${postId}`);
    }

    console.log(`\n📊 Total views created: ${createdViews.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding views:', error);
    process.exit(1);
  }
}

async function seedLikes() {
  console.log('\n❤️  Starting to seed likes...\n');
  const createdLikes = [];

  try {
    // Create likes for each published post
    for (const postId of PUBLISHED_POST_IDS) {
      // 30-80% of viewers will like the post
      const likeCount = faker.number.int({ min: 3, max: 8 });
      const likers = faker.helpers.arrayElements(SAMPLE_USERS, likeCount);

      for (const user of likers) {
        const like = await prisma.like.create({
          data: {
            postId,
            userId: user.id,
            createdAt: faker.date.past()
          }
        });
        
        createdLikes.push(like);
      }
      
      console.log(`✅ Created ${likeCount} likes for post: ${postId}`);
    }

    console.log(`\n📊 Total likes created: ${createdLikes.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding likes:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await seedViews();
    await seedLikes();
    console.log('\n✅ Engagement seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding engagement data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
