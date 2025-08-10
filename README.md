# CRIF CB Integration - Unified Application

This is a unified React application that combines three separate credit bureau management modules into a single, cohesive system.

## 🚀 Features

### 1. Dashboard Module (`/dashboard`)
- Lead management and tracking
- Credit bureau report generation
- Person management interface
- New inquiry creation
- Lead details and editing

### 2. Score Report Module (`/score-report`)
- Detailed credit score analysis
- Comprehensive credit report display
- Interactive navigation sidebar
- Multiple sections: Applicant Info, Scores, Personal Information, Account Summary, Tradelines, Inquiries

### 3. Consent Form Module (`/consent-form`)
- Credit check consent form
- Withdrawal form functionality
- User consent management

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Shadcn/ui components
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crif-cb-integration-unified
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup**
   
   **For Local Development:**
   ```bash
   # Create development environment file
   cp .env.development.example .env.development
   # Edit .env.development and set your local API URL
   VITE_API_BASE_URL=http://localhost:8080
   ```
   
   **For Production (AWS Amplify):**
   - Go to AWS Amplify Console
   - Navigate to your app's Environment Variables
   - Add `VITE_API_BASE_URL` with your production API URL
   - Example: `https://api.mycompany.com`

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── CreditBureauReport.tsx
│   ├── LeadDashboard.tsx
│   ├── LeadDetails.tsx
│   ├── PersonManagement.tsx
│   ├── ProtectedRoute.tsx
│   ├── CreditCheckForm.tsx
│   ├── WithdrawalForm.tsx
│   └── Navigation.tsx
├── pages/              # Page components
│   ├── DashboardIndex.tsx
│   ├── ScoreReportIndex.tsx
│   ├── ConsentFormIndex.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx
│   ├── useCreditReport.ts
│   ├── usePagination.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                # Utility functions
│   └── utils.ts
├── data/               # Sample data and types
│   └── sampleData.ts
├── services/           # API services
│   └── creditReportApi.ts
├── config/             # Configuration files
│   └── apiConfig.ts
├── assets/             # Static assets
│   └── nivasa-logo.png
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🛣️ Routing

The application uses React Router with the following routes:

- `/` - Redirects to dashboard (protected)
- `/login` - Login page
- `/dashboard` - Main dashboard (protected)
- `/credit-report` - Credit report viewer
- `/consent-form` - Credit check consent form
- `/consent-form/withdraw` - Withdrawal form
- `*` - 404 Not Found page

## 🔐 Authentication & Role-Based Access Control

The application includes a comprehensive authentication and authorization system:

### Authentication Features:
- Protected routes
- Login/logout functionality
- Session management with JWT tokens
- AWS Cognito integration

### Role-Based Access Control (RBAC):
- **JWT Token Decoding**: Uses `jwt-decode` library to extract user roles from Cognito JWT tokens
- **Role Extraction**: Extracts `cognito:groups` claim to determine user roles
- **Context-Based**: User roles stored in React Context (`AuthContext`)
- **Persistent**: Roles persist across page refreshes via localStorage token
- **Flexible**: No hardcoded roles or permissions - fully configurable

### User Roles:
- **Dynamic**: Roles are extracted directly from AWS Cognito groups
- **Flexible**: Any Cognito group can be used as a role
- **Extensible**: New roles can be added without code changes
- **Configurable**: Permissions can be managed through API or configuration

### Current Implementation:
- **Role Extraction**: Automatically extracts all Cognito groups as user roles
- **No Hardcoded Permissions**: Permissions are not predefined in the frontend
- **API-Ready**: Framework is ready for API-based permission management
- **Future-Ready**: Can be extended to fetch permissions from backend APIs

### Role Assignment in AWS Cognito:

1. **Create User Groups** in AWS Cognito Console:
   ```bash
   # Example groups to create:
   - admin
   - loan_officer
   - analyst
   - viewer
   ```

2. **Assign Users to Groups**:
   - Go to AWS Cognito Console
   - Navigate to User Pools → Users
   - Select a user → Add to group
   - Choose the appropriate group

3. **JWT Token Structure**:
   ```json
   {
     "sub": "user-id",
     "cognito:username": "username",
     "email": "user@example.com",
     "cognito:groups": ["admin", "loan_officer"],
     "exp": 1234567890
   }
   ```

### Adding New Role-Based UI Rules:

The current implementation provides a flexible framework that can be extended in several ways:

1. **API-Based Permissions** (Recommended):
   ```typescript
   // In src/utils/jwtUtils.ts - extend getRolePermissions function
   export const getRolePermissions = async (role: UserRole): Promise<RolePermissions> => {
     const response = await fetch(`/api/permissions/${role}`);
     return response.json();
   };
   ```

2. **Configuration-Based Permissions**:
   ```typescript
   // Create a configuration file or fetch from environment
   const PERMISSION_CONFIG = {
     'admin': { canDeleteLoan: true, canApproveLoan: true },
     'loan_officer': { canApproveLoan: true, canEditLeadDetails: true },
   };
   ```

3. **Use Role-Based Rendering** (when permissions are implemented):
   ```typescript
   import { RoleBasedRender } from '@/components/RoleBasedRender';

   <RoleBasedRender requiredPermissions={{ canDeleteLoan: true }}>
     <Button>Delete Loan</Button>
   </RoleBasedRender>
   ```

4. **Use Hook for Conditional Logic**:
   ```typescript
   import { usePermissions } from '@/components/RoleBasedRender';

   const { can } = usePermissions();
   
   if (can('canDeleteLoan')) {
     // Show delete button
   }
   ```

### Security Notes:
- **Frontend Only**: UI permissions are for user experience only
- **Backend Enforcement**: All API endpoints must still enforce role checks
- **Token Validation**: Always validate JWT tokens on the backend
- **No Sensitive Data**: Never expose sensitive data based on frontend permissions alone

## 🎨 UI Components

Built with Shadcn/ui, the application includes:
- Responsive design
- Dark/light theme support
- Accessible components
- Modern UI patterns

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=your_api_base_url
VITE_APP_TITLE=CRIF CB Integration
```

### API Configuration
The application uses environment variables for API configuration to support different environments:

#### Environment Variables

- **`VITE_API_BASE_URL`**: The base URL for all API calls
  - Development: `http://localhost:8080`
  - Production: `https://api.mycompany.com`

#### Configuration Files

- **`src/config/apiConfig.ts`**: Centralized API configuration
  - Exports `API_CONFIG` object with base URL and headers
  - Provides helper functions: `buildApiUrl()`, `getAuthUrl()`, etc.
  - All API calls should use these helper functions

#### Usage Example

```typescript
import { getAuthUrl, API_CONFIG } from '@/config/apiConfig';

// Instead of hardcoded URLs
const response = await fetch('https://api.example.com/auth', {
  headers: { 'Content-Type': 'application/json' }
});

// Use configuration
const response = await fetch(getAuthUrl(), {
  headers: API_CONFIG.HEADERS
});
```

#### Environment Setup

**Local Development:**
1. Create `.env.development` file in project root
2. Add: `VITE_API_BASE_URL=http://localhost:8080`

**Production (AWS Amplify):**
1. Go to AWS Amplify Console
2. Navigate to Environment Variables
3. Add: `VITE_API_BASE_URL=https://api.mycompany.com`

**Note:** Environment files (`.env*`) are gitignored to prevent committing sensitive values.

### Legacy API Configuration
Update the API endpoints in `src/services/creditReportApi.ts` to connect to your backend services.

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository. 