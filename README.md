# مساري (Masari)

A mobile transportation management system connecting university students with monthly bus subscription drivers.

## 🚀 Features

- **Phone-based Authentication**: Secure OTP login via phone number
- **Role-based Access**: Separate interfaces for students and drivers
- **Subscription Management**: Manual billing with receipt upload and approval
- **Smart Location Polling**: Dynamic polling based on proximity to students
- **Attendance Tracking**: Real-time status updates and notifications
- **Real-time Updates**: Live status synchronization via Supabase Realtime

## 📱 Tech Stack

### Frontend
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand + TanStack React Query
- **Maps & Location**: react-native-maps, expo-location
- **Styling**: NativeWind / StyleSheet

### Backend
- **Database**: Supabase (PostgreSQL 17)
- **Authentication**: Supabase Auth (Phone OTP)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions

## 🏗️ Project Structure

```
masari/
├── app/                    # Expo Router pages
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── services/               # Business logic services
├── repositories/           # Data access layer
├── store/                  # Zustand stores
├── types/                  # TypeScript types
├── utils/                  # Utility functions
├── lib/                    # External library configs
└── docs/                   # Documentation
```

## 📊 Database Schema

### Tables
- `users`: User information (students and drivers)
- `student_driver_link`: Student-driver relationships with pickup locations
- `subscriptions`: Subscription payments and status
- `daily_attendance`: Daily attendance tracking
- `driver_locations`: Driver location updates

See [docs/database_schema.md](docs/database_schema.md) for complete schema details.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd masari

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure Supabase
# Update .env with your Supabase credentials
```

### Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📖 Documentation

- [Database Schema](docs/database_schema.md)
- [System Architecture](docs/system_architecture.md)
- [Step 1: Database Initialization](docs/step1_completion.md)
- [Step 2: Project Setup, Auth & Routing](docs/step2_completion.md)
- [Step 3: Subscription & File Upload Flow](docs/step3_completion.md)
- [Step 4: Location Polling & Realtime Maps](docs/step4_completion.md)

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Phone-based authentication with OTP
- Secure session management
- Private storage buckets

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 Development Guidelines

- Use TypeScript strict mode
- Follow the existing code style
- Write tests for new features
- Update documentation for changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team.

---

**Built with ❤️ for university students and drivers**
