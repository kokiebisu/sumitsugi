# DevContainer Project

A Node.js/TypeScript project with devcontainer support.

## Features

- Node.js 20
- TypeScript
- Git
- Docker-in-Docker support

## Getting Started

1. Open this folder in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. VS Code will build the container and set up the environment
4. Once ready, run `npm run dev` to start the development server

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm test` - Run tests
- `npm run test:e2e` - Run E2E tests with Playwright

## Project Structure

```
.
├── .devcontainer/
│   ├── devcontainer.json
│   └── Dockerfile
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## E2E Test Reports

View the latest E2E test results and screenshots:
- GitHub Pages: https://kokiebisu.github.io/tsumugi/e2e-reports/

E2E tests run automatically on every PR and push to main. Test reports include screenshots, videos, and traces for debugging failures.

# tsumugi
