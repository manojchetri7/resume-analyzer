import { ResumeAnalysisResult, SampleJob, SampleResume } from '../types';

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'swe-entry',
    title: 'Alex Mercer — Junior Software Engineer',
    role: 'Software Development',
    experienceLevel: 'Entry / 1-2 Years',
    content: `ALEX MERCER
San Francisco, CA | alex.mercer@email.com | linkedin.com/in/alexmercer | github.com/alexmercer

PROFESSIONAL SUMMARY
Passionate Full-Stack Developer with 1.5 years of experience building modern web applications with TypeScript, React, and Node.js. Enthusiastic about clean system architecture, REST APIs, and responsive design.

EDUCATION
B.S. in Computer Science | State University (2020 – 2024)
Relevant Coursework: Data Structures & Algorithms, Database Systems, Web Engineering, Software Architecture.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, HTML5, CSS3, SQL (PostgreSQL)
- Frontend: React, Next.js, Tailwind CSS, Redux Toolkit, Responsive Web Design
- Backend: Node.js, Express, RESTful APIs, Prisma ORM
- Tools & Cloud: Git, GitHub, Docker (basics), Jest, Vercel, Postman

EXPERIENCE
Junior Frontend Developer | TechSphere Labs (June 2024 – Present)
- Developed and maintained 12+ responsive customer dashboard components using React and Tailwind CSS.
- Optimized bundle sizes by 28% through code splitting and tree shaking.
- Integrated REST APIs with React Query for efficient caching and reduced network requests.
- Wrote unit and integration tests using Jest and React Testing Library, maintaining 85% test coverage.

Software Engineering Intern | CloudForge Solutions (June 2023 – August 2023)
- Built an internal ticket monitoring dashboard using Node.js and Express.
- Collaborated in daily agile standups and implemented peer code review practices.

PROJECTS
DevOrbit Collaborative Workspace (2024)
- Built a real-time markdown editor and project management board with React, Node.js, and WebSockets.
- Deployed on Vercel and Railway with automated CI/CD pipelines.`,
  },
  {
    id: 'data-analyst',
    title: 'Priya Sharma — Data Analyst / AI Aspirant',
    role: 'Data & Analytics',
    experienceLevel: 'Entry-Mid / 2 Years',
    content: `PRIYA SHARMA
Austin, TX | priya.sharma@email.com | linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Detail-oriented Data Analyst with 2 years of experience turning complex datasets into executive dashboards, financial forecasts, and business insights using SQL, Python, Tableau, and statistical modeling.

EDUCATION
B.S. in Statistics & Data Science | University of Texas (2019 – 2023)

TECHNICAL SKILLS
- Data Analysis: Python (Pandas, NumPy, Scikit-learn), R, SQL (PostgreSQL, BigQuery)
- Visualization: Tableau, Power BI, Matplotlib, Seaborn
- Techniques: A/B Testing, Regression Modeling, Cohort Analysis, KPI Dashboards
- Tools: Git, Excel (Advanced, Macros), Jupyter Notebooks

EXPERIENCE
Data Analyst | Lumina Commerce (July 2023 – Present)
- Built weekly revenue and customer churn dashboards in Tableau utilized by executive leadership.
- Queried large-scale datasets (5M+ rows) using Google BigQuery and SQL window functions.
- Conducted multivariate A/B testing on checkout funnel redesign, increasing conversion by 4.2%.

Business Intelligence Intern | FinVibe Analytics (Jan 2023 – May 2023)
- Automated monthly financial variance reports using Python scripts, saving 15 hours per month.
- Created data cleaning pipelines to normalize third-party vendor sales data.`,
  },
  {
    id: 'marketing-digital',
    title: 'Marcus Vance — Digital Marketing Specialist',
    role: 'Marketing & Growth',
    experienceLevel: 'Mid / 3 Years',
    content: `MARCUS VANCE
Chicago, IL | marcus.vance@email.com | linkedin.com/in/marcusvance

PROFESSIONAL SUMMARY
Results-driven Digital Marketing Specialist with 3+ years experience across performance advertising, SEO strategy, content marketing, and email automation campaigns.

EDUCATION
B.A. in Marketing & Communications | Illinois State (2018 – 2022)

CORE COMPETENCIES
- Digital Marketing: SEO / SEM, Google Ads, Meta Ads Manager, LinkedIn Campaign Manager
- Analytics & Attribution: Google Analytics 4, HubSpot, Mixpanel, Tag Manager
- Content & Creative: Copywriting, Email Automation (Klaviyo), Figma (basics), Canva

EXPERIENCE
Digital Marketing Specialist | Apex Growth Agency (2023 – Present)
- Managed paid acquisition budgets across Google & Meta totaling $60K/month at an average 3.4x ROAS.
- Boosted organic search traffic by 44% in 9 months via comprehensive content clustering and technical SEO audits.
- Designed automated lead-nurturing workflows with 32% open rate.`,
  },
];

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'fullstack-job',
    title: 'Full Stack Engineer (React, Node.js, Cloud)',
    companyPlaceholder: 'NovaTech Digital',
    description: `About the Role:
NovaTech Digital is seeking an innovative Full Stack Engineer to join our high-growth platform team. You will build and scale high-performance web applications, collaborate with product designers, and craft reliable backend services.

Key Responsibilities:
- Build modular, accessible user interfaces using TypeScript, React, and modern CSS frameworks.
- Design and implement scalable RESTful and GraphQL APIs with Node.js and Express or NestJS.
- Manage relational database schemas and queries with PostgreSQL and ORM tools.
- Write thorough automated unit and integration tests (Jest, Playwright).
- Deploy and monitor microservices using Docker, AWS or GCP, and CI/CD pipelines.
- Collaborate across cross-functional teams in an agile environment.

Requirements & Qualifications:
- Bachelor's degree in Computer Science, Engineering, or equivalent practical experience.
- 1–3 years of professional full-stack web development experience.
- Strong proficiency in JavaScript/TypeScript, React, Node.js, and SQL.
- Familiarity with cloud infrastructure (AWS/GCP), Docker containerization, and Git version control.
- Clear communication skills and enthusiasm for continuous learning.`,
  },
  {
    id: 'ai-data-job',
    title: 'Data & AI Analyst (Python, SQL, BI)',
    companyPlaceholder: 'Astral Insights Corp',
    description: `Astral Insights Corp is looking for an analytical thinker to join our Analytics & AI team.

Responsibilities:
- Extract, clean, and analyze enterprise transactional data using SQL and Python.
- Develop interactive dashboards and reporting systems in Tableau or Power BI.
- Partner with machine learning engineers to prep training data and evaluate prototype AI models.
- Conduct statistical hypothesis testing and cohort analysis to guide business strategy.
- Communicate complex analytical findings to non-technical stakeholders clearly.

Qualifications:
- Bachelor's degree in Statistics, Data Science, Mathematics, or Computer Science.
- 1-2 years experience with Python (Pandas, NumPy) and SQL.
- Proven experience creating business intelligence dashboards (Tableau/Power BI).
- Understanding of machine learning fundamentals and exploratory data analysis.`,
  },
  {
    id: 'product-job',
    title: 'Associate Product Manager (APM)',
    companyPlaceholder: 'Starlight Products',
    description: `We are looking for an Associate Product Manager to help shape the next generation of SaaS collaboration software.

Responsibilities:
- Conduct user research, synthesize customer feedback, and write clear PRDs (Product Requirement Documents).
- Work alongside engineering and UX design teams to prioritize sprint backlogs and release roadmaps.
- Analyze feature adoption, conversion metrics, and user retention with analytics tools.
- Lead user acceptance testing and coordinate go-to-market launches.

Qualifications:
- Degree in Business, Computer Science, Design, or equivalent.
- Strong problem-solving instincts, analytical literacy, and empathetic communication.
- Basic familiarity with software development lifecycle and wireframing tools.`,
  },
];

export const DEMO_PREVIEW_RESULT: ResumeAnalysisResult = {
  overallScore: 84,
  scoreEstimationNote: 'This AI match rating reflects an algorithmic alignment calculation of your resume against the provided job description across skills (90%), experience (78%), education (88%), and keywords (82%). This is an analytical preparation tool and does not represent a hiring entity’s formal recruitment decision.',
  scoringBreakdown: {
    skillsAlignment: {
      score: 90,
      details: 'High alignment with core tech stack (React, TypeScript, Node.js, REST APIs). Minor gap in Docker containerization experience.',
    },
    experienceAlignment: {
      score: 78,
      details: 'Meets the 1+ years requirement with practical agile product development and test coverage experience.',
    },
    educationAlignment: {
      score: 88,
      details: 'B.S. in Computer Science directly satisfies the degree requirement.',
    },
    keywordsAlignment: {
      score: 82,
      details: 'Strong presence of relevant industry terms: TypeScript, REST APIs, CI/CD, responsive design.',
    },
  },
  summary: 'Your profile demonstrates strong foundational capability for this Full Stack Engineer position. Your hands-on experience with modern TypeScript and React aligns directly with NovaTech’s frontend expectations, while your backend familiarity with Node.js and SQL establishes good full-stack breadth.',
  matchingSkills: [
    'TypeScript & Modern JavaScript',
    'React & Component Architecture',
    'Node.js & Express REST APIs',
    'SQL & Relational Databases (PostgreSQL)',
    'Git & GitHub Collaboration',
    'Automated Testing (Jest)',
    'Tailwind CSS & Responsive UI',
  ],
  missingSkills: [
    'Docker & Containerized Deployments',
    'Cloud Platforms (AWS / GCP foundational services)',
    'GraphQL API development or consumption',
    'End-to-End Testing (Playwright / Cypress)',
  ],
  relevantKeywords: [
    'RESTful APIs',
    'Agile / Scrum',
    'Code Splitting',
    'Unit Testing',
    'CI/CD Pipelines',
    'Cross-functional Collaboration',
  ],
  resumeStrengths: [
    'Quantifiable achievements (e.g., "optimized bundle sizes by 28%", "85% test coverage").',
    'Clean organization with clear technical skills taxonomy.',
    'Demonstrated end-to-end full-stack project (DevOrbit Collaborative Workspace).',
  ],
  improvementSuggestions: [
    'Highlight familiarity with Docker or cloud hosting (even basic containerization projects) to address the infrastructure requirements.',
    'Add a bullet point demonstrating how you handle error tracking, logging, or API documentation (Swagger/OpenAPI).',
    'Mention any experience with GraphQL or state management patterns in complex apps.',
  ],
  actionableRecommendations: [
    {
      priority: 'High',
      action: 'Containerize your DevOrbit project using Docker and add a Dockerfile to your GitHub repository.',
      rationale: 'NovaTech lists Docker as a key requirement. Showing a containerized personal project directly bridges this gap.',
    },
    {
      priority: 'Medium',
      action: 'Explicitly mention PostgreSQL query optimization or schema migration experience.',
      rationale: 'The job posting highlights relational database schema management.',
    },
    {
      priority: 'Low',
      action: 'Add a 1-line note regarding CI/CD automation workflows (e.g. GitHub Actions).',
      rationale: 'Reinforces engineering maturity for modern team workflows.',
    },
  ],
};

export const FAQ_ITEMS = [
  {
    question: 'How does Cosmic Career AI analyze my resume?',
    answer: 'Our AI system securely extracts text and semantic structure from your uploaded PDF resume. It evaluates your skills, experience trajectory, educational background, and terminology against your target job description using Google Gemini models, generating a multi-dimensional alignment report.',
  },
  {
    question: 'Is my resume data stored permanently or sold?',
    answer: 'No. Your resume is processed strictly in temporary server memory to generate your analysis. We never sell your personal data or train public models on your personal documents. You can also click "Clear Session Data" at any time to purge all local session state.',
  },
  {
    question: 'Does the job match score guarantee an interview or offer?',
    answer: 'No. The match score is an algorithmic preparation metric designed to help you discover gaps and improve your relevance. Real hiring involves subjective team factors, portfolio reviews, and cultural criteria that cannot be calculated by an AI score alone.',
  },
  {
    question: 'Can I use this if I don’t have an updated resume yet?',
    answer: 'Yes! In the "Career & Skills Finder" section, you can simply input your current qualification (e.g. B.Com, B.Tech, or self-taught), your current skills, and your career interests to receive tailored career paths and a complete 30/60/90-day learning roadmap.',
  },
  {
    question: 'How does the AI Career Guide Chatbot personalize its advice?',
    answer: 'The AI Career Guide acts as your personalized mentor. By default, it operates on what you share in conversation. If you choose, you can click "Share analysis with AI Guide" so it can reference your specific resume skills and gaps to give targeted guidance.',
  },
];
