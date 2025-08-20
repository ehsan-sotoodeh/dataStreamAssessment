# Data Stream Assessment

An interactive dashboard using svelte.

## Live Demo

[Live Demo](https://ehsan-sotoodeh.github.io/dataStreamAssessment/)

## ✨ Features

- **CSV File Upload**: Drag & drop or click to upload CSV files
- **Sample Data**: Built-in sample dataset for immediate testing
- **Data Validation**: Automatic column detection and data type validation
- **Interactive Map**: Built with Leaflet.js for location visualization
- **Location Markers**: Clickable markers for each monitoring location
- **Geographic Context**: Shows latitude/longitude coordinates
- **Map Integration**: Click markers to automatically select locations for analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices using Tailwind
- **Comprehensive Testing**: Vitest for unit testing with coverage reporting
- **Code Quality**: ESLint and Prettier for consistent code style

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 22.12.0
- **npm**: Version 8 or higher
- **Docker**: Version 20 or higher (for containerized deployment)

### Option 1: Docker Deployment

#### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/ehsan-sotoodeh/dataStreamAssessment
cd dataStreamAssessment

# Build the Docker image
docker build -t datastream-assessment .

# Run the container
docker run -p 8080:80 datastream-assessment
```

The application will be available at **http://localhost:8080**

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/ehsan-sotoodeh/dataStreamAssessment
cd dataStreamAssessment

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5180**

#### Available Scripts

**Development**

- `npm run dev` - Start development server (port 5180)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Testing**

- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with interactive UI

**Code Quality**

- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run quality-check` - Build, lint, and test everything

**Type Checking**

- `npm run check` - Type check with Svelte
- `npm run check:watch` - Watch mode type checking
