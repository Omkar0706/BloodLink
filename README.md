# Blood Bridge Management System

An AI-powered blood donation coordination and emergency response platform that connects donors, recipients, and healthcare facilities for faster emergency response and better healthcare outcomes.

## 🩸 Overview

Blood Bridge Management System is a comprehensive web application designed to revolutionize blood donation coordination. The platform leverages cutting-edge AI technology to create seamless connections between blood donors and recipients, ensuring rapid emergency response and efficient blood management.

## ✨ Features

### Core Features
- **AI-Powered Donor Matching**: Advanced algorithms match blood requests with the nearest eligible donors in real-time
- **Emergency Response System**: Instant alerts and rapid response system for critical blood requirements
- **Bridge Coordination**: Efficiently manage blood donation bridges across multiple locations and cities
- **Location Services**: GPS-based donor location tracking for emergency response coordination
- **Quality Assurance**: Comprehensive donor screening and donation tracking for safety
- **Analytics Dashboard**: Real-time insights into donation patterns, availability, and trends

### Key Capabilities
- **Real-time Donor Matching**: Find compatible donors based on blood group, location, and availability
- **Emergency Request Management**: Create and track emergency blood requests with priority handling
- **Donor Management**: Complete donor profiles with medical history and donation tracking
- **Bridge Management**: Coordinate multiple blood donation centers and bridges
- **Analytics & Reporting**: Comprehensive dashboards with donation statistics and trends
- **Mobile Responsive**: Fully responsive design for all devices

## 🛠 Technology Stack

### Frontend
- **React.js 18+** with TypeScript
- **Next.js 14** for server-side rendering and routing
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for state management and API calls
- **Lucide React** for icons

### Backend (Planned)
- **FastAPI** (Python) for REST APIs
- **WebSocket** support for real-time features
- **SQLAlchemy** for database ORM
- **Pydantic** for data validation
- **Celery** for background tasks
- **Redis** for caching and message queuing

### Database (Planned)
- **Azure Database for PostgreSQL** (primary database)
- **Redis Cache** for session management and real-time data
- **Azure Blob Storage** for file storage

### AI/ML Services (Planned)
- **Azure OpenAI Service** for chatbot functionality
- **Azure Machine Learning** for predictive analytics
- **Custom ML models** for donor engagement prediction

### Azure Services (Planned)
- **Azure App Service** for hosting
- **Azure Functions** for serverless operations
- **Azure Service Bus** for messaging
- **Azure Notification Hubs** for push notifications
- **Azure Maps** for location services
- **Azure Monitor** for logging and analytics

## 📊 Data Insights

Based on the provided datasets, the system includes:

### Donor Demographics
- **Gender Distribution**: Female (71), Male (64), Other (65) - fairly balanced
- **Average Age**: ~38 years (Range: 18 – 61)
- **Top Cities**: Mumbai (35), Pune (30), Hyderabad (27), Kolkata (27), Delhi (24)

### Blood Group Availability
- **Most Common**: B- (32), A- (28), A+ (28), B+ (26), O+ (26)
- **Least Common**: AB+ (18)

### Donor Roles
- **Fighters**: 78
- **Emergency Donors**: 73
- **Bridge Donors**: 49

### Engagement Statistics
- **Active Donors**: 6,351
- **Inactive Donors**: 682
- **Bridge Status**: Active (786), Inactive (6,247)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Google Maps API Key (for map functionality)

### Google Maps Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blood-bridge-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
blood-bridge-management-system/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   │   └── emergency/          # Emergency request page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # Reusable components
├── lib/                        # Utility libraries
│   └── mockData.ts            # Mock data for development
├── types/                      # TypeScript type definitions
│   └── index.ts               # Main type definitions
├── utils/                      # Utility functions
│   └── helpers.ts             # Helper functions
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

## 🎯 Key Features Implementation

### 1. Emergency Blood Request System
- Real-time donor matching based on location and blood group
- Priority-based request handling (Critical, High, Medium, Low)
- Automated donor notification system
- Distance-based matching algorithm

### 2. Donor Management
- Comprehensive donor profiles
- Donation history tracking
- Eligibility checking based on age and donation frequency
- Blood group compatibility validation

### 3. Analytics Dashboard
- Real-time blood availability by group
- Donor engagement metrics
- Geographic distribution analysis
- Donation trend visualization

### 4. Bridge Coordination
- Multi-location bridge management
- Donor allocation across bridges
- Bridge performance metrics
- Geographic coverage optimization

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database (for future backend integration)
DATABASE_URL=your_database_url

# Azure Services (for future integration)
AZURE_OPENAI_API_KEY=your_openai_key
AZURE_MAPS_KEY=your_maps_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

The application includes comprehensive testing setup:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure authentication (planned)
- Data encryption (planned)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **AWS Amplify**: Use Next.js build configuration
- **Azure Static Web Apps**: Deploy with Azure integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: omkarchoudhury0706@gmail.com
- **Emergency Hotline**: +91 7789056907
- **Documentation**: [docs.bloodbridge.com](https://docs.bloodbridge.com)

## 🙏 Acknowledgments

- Blood donation organizations and volunteers
- Healthcare professionals and hospitals
- Open source community contributors
- Azure and Microsoft for cloud services

---

**Blood Bridge Management System** - Connecting hearts through blood donation technology. ❤️
#
