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
# tsumugi
