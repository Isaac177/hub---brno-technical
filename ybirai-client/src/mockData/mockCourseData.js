export const mockCourseData = {
    id: "1",
    title: "The Complete 2024 Web Development Bootcamp",
    description: "Become a Full-Stack Web Developer with just ONE course. HTML, CSS, Javascript, Node, React, PostgreSQL, Web3 and DApps",
    featuredImageUrl: "https://picsum.photos/300/200",
    thumbnailUrl: "https://picsum.photos/seed/webdev/640/360",
    categoryId: "web-development",
    schoolId: "tech-academy",
    averageRating: 4.7,
    enrollmentCount: 1350487,
    price: 99.99,
    language: "English",
    subtitles: ["English", "Arabic [Auto]", "14 more"],
    isBestseller: true,
    lastUpdated: "2024-08-01",

    learningObjectives: [
        "Build 16 web development projects for your portfolio, ready to apply for junior developer jobs.",
        "Learn the latest technologies, including Javascript, React, Node and even Web3 development.",
        "After the course you will be able to build ANY website you want.",
        "Build fully-fledged websites and web apps for your startup or business.",
        "Work as a freelance web developer.",
        "Master frontend development with React",
        "Master backend development with Node",
        "Learn professional developer best practices."
    ],

    relatedTopics: ["Web Development", "Development"],

    courseIncludes: [
        { type: "on-demand video", amount: 61, unit: "hours", icon: "https://picsum.photos/seed/video/32/32" },
        { type: "coding exercises", amount: 7, icon: "https://picsum.photos/seed/exercise/32/32" },
        { type: "articles", amount: 65, icon: "https://picsum.photos/seed/article/32/32" },
        { type: "downloadable resources", amount: 194, icon: "https://picsum.photos/seed/download/32/32" },
        { type: "access", description: "Access on mobile and TV", icon: "https://picsum.photos/seed/access/32/32" },
        { type: "certificate", description: "Certificate of completion", icon: "https://picsum.photos/seed/certificate/32/32" }
    ],

    courseContent: {
        sections: 44,
        lectures: 373,
        totalLength: "61h 44m"
    },

    syllabus: [
        {
            title: "Front-End Web Development",
            lectures: 9,
            duration: "37min",
            thumbnailUrl: "https://picsum.photos/seed/frontend/120/68",
            topics: [
                { title: "What You'll Get in This Course", duration: "03:08", isPreview: true },
                { title: "Download the Course Syllabus", duration: "00:12", isPreview: true },
                { title: "Download the 12 Rules to Learn to Code eBook [Latest Edition]", duration: "00:42" },
                { title: "Download the Required Software", duration: "00:43" },
                { title: "How Does the Internet Actually Work?", duration: "05:27", isPreview: true },
                { title: "How Do Websites Actually Work?", duration: "08:22", isPreview: true },
                { title: "How to Get the Most Out of the Course", duration: "09:33" },
                { title: "How to Get Help When You're Stuck", duration: "06:39" },
                { title: "Pathfinder", duration: "02:23" }
            ]
        },
        {
            title: "Introduction to HTML",
            lectures: 8,
            duration: "49min",
            thumbnailUrl: "https://picsum.photos/seed/html/120/68",
            topics: [
                { title: "A Note About 2023 Course Updates", duration: "00:36", isPreview: true },
                { title: "What is HTML?", duration: "04:18", isPreview: true },
                { title: "How to Download the Course Resources", duration: "02:43" },
                { title: "HTML Heading Elements", duration: "14:24" },
                { title: "HTML Paragraph Elements", duration: "08:40" },
                { title: "Self Closing Tags", duration: "11:40" },
                { title: "[Project] Movie Ranking", duration: "05:43" },
                { title: "How to Ace this Course", duration: "01:24" }
            ]
        }
    ],

    requirements: [
        "No programming experience needed - I'll teach you everything you need to know",
        "A computer with access to the internet",
        "No paid software required",
        "I'll walk you through, step-by-step how to get all the software installed and set up"
    ],

    longDescription: `
    <p>Welcome to the Complete Web Development Bootcamp, the only course you need to learn to code and become a full-stack web developer. With 150,000+ ratings and a 4.8 average, my Web Development course is one of the HIGHEST RATED courses in the history of Udemy!</p>
    <p>At 62+ hours, this Web Development course is without a doubt the most comprehensive web development course available online. Even if you have zero programming experience, this course will take you from beginner to mastery.</p>
    <h3>What you'll learn:</h3>
    <ul>
      <li>Build 16 web development projects for your portfolio, ready to apply for junior developer jobs.</li>
      <li>Learn the latest technologies, including Javascript, React, Node and even Web3 development.</li>
      <li>Build fully-fledged websites and web apps for your startup or business.</li>
      <li>Work as a freelance web developer.</li>
      <li>Master frontend development with React</li>
      <li>Master backend development with Node</li>
      <li>Learn professional developer best practices.</li>
    </ul>
    <h3>Why Choose This Course?</h3>
    <p>This course is constantly updated with new content, projects and modules. Here's what's been added recently:</p>
    <ol>
      <li><strong>Web3 Development</strong> - Learn the latest in blockchain technology and how to create DApps.</li>
      <li><strong>Updated React Lessons</strong> - Now includes React 18 and Next.js content.</li>
      <li><strong>New Database Module</strong> - Learn how to work with PostgreSQL, a powerful relational database.</li>
    </ol>
    <h3>Course Structure</h3>
    <p>The course is divided into several sections:</p>
    <ul>
      <li><strong>Front-End Web Development</strong>: HTML, CSS, JavaScript</li>
      <li><strong>Back-End Web Development</strong>: Node.js, Express.js, APIs</li>
      <li><strong>Database Fundamentals</strong>: SQL, MongoDB</li>
      <li><strong>React and Modern JavaScript</strong>: ES6+, React Hooks, Context API</li>
      <li><strong>Web3 and Blockchain</strong>: Solidity, Ethereum, DApps</li>
    </ul>
    <h3>Who is this course for?</h3>
    <p>This course is perfect for:</p>
    <ul>
      <li>Complete beginners who want to learn to code</li>
      <li>Students looking for a career change into the tech industry</li>
      <li>Entrepreneurs who want to build their own websites and apps</li>
      <li>Existing developers who want to upskill by learning the latest technologies</li>
    </ul>
    <p>Join thousands of successful students who have transformed their careers with this course. Start your journey to becoming a full-stack web developer today!</p>
    <p><a href="#enroll-now">Enroll now</a> and let's start coding together!</p>
  `,
    reviews: [
        {
            name: "Mudiaga Moody U.",
            coursesCount: 20,
            reviewsCount: 14,
            rating: 5,
            date: "4 years ago",
            content: "This course is quite comprehensive when compared with other courses available on this platform that is why I bought it. It is packed full with amazing content and like the description, it did make me full stack web developer. The instructor is a very good teacher using visual aids (not just talking) and simple illustrations to drive home a point. This course does not teach everything but the basics of everything frontend and backend. I enjoyed the course, the jokes, the projects, challenges.",
            avatarUrl: "https://picsum.photos/seed/mudiaga/64/64"
        },
        {
            name: "Marc D.",
            rating: 5,
            date: "a week ago",
            content: "This is an excellent course! Well documented and a lot of challenges along the way. I'd highy recommend to anyone trying to be a full stack developer. Great was the fact that Angela mentioned at the beginning to listen to the materials and practice instead of typing the code along. It really helps in soaking the knowledge. Thumbs up!",
            avatarUrl: "https://picsum.photos/seed/marc/64/64"
        },
        {
            name: "Yakov T.",
            rating: 5,
            date: "a month ago",
            content: "Dr. Angela Yu's Complete Web Development Bootcamp was an absolute game-changer for me! Her teaching style is incredibly smart and understanding, and the way she breaks down complex concepts step by step made all the difference in my understanding.",
            avatarUrl: "https://picsum.photos/seed/yakov/64/64"
        }
    ],

    instructor: {
        name: "Dr. Angela Yu",
        title: "Developer and Lead Instructor",
        rating: 4.7,
        reviewCount: 885210,
        studentCount: 2898914,
        courseCount: 7,
        bio: "I'm Angela, I'm a developer with a passion for teaching. I'm the lead instructor at the London App Brewery, London's leading Programming Bootcamp. I've helped hundreds of thousands of students learn to code and change their lives by becoming a developer. I've been invited by companies such as Twitter, Facebook and Google to teach their employees. My first foray into programming was when I was just 12 years old, wanting to build my own Space Invader game. Since then, I've made hundred of websites, apps and games. But most importantly, I realised that my greatest passion is teaching. I spend most of my time researching how to make learning to code fun and make hard concepts easy to understand. I apply everything I discover into my bootcamp courses. In my courses, you'll find lots of geeky humour but also lots of explanations and animations to make sure everything is easy to understand. I'll be there for you every step of the way.",
        avatarUrl: "https://picsum.photos/200/200"
    }
};
