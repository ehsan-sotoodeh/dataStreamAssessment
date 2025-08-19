# Data Stream Assessment

A modern, full-stack web application built with **SvelteKit**, featuring comprehensive testing, code quality tools, and a robust development workflow.

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd dataStreamAssessment


# Running using docker
docker build -t dateStream .
docker run -p 8080:80 dateStream




# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5180**

### Available Scripts

#### Development

- `npm run dev` - Start development server (port 5180)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Testing

- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with interactive UI

#### Code Quality

- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run quality-check` - Build, lint, and test everything

#### Type Checking

- `npm run check` - Type check with Svelte
- `npm run check:watch` - Watch mode type checking
