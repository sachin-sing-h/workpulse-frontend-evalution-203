# WorkPulse Frontend

This is the frontend repository for the WorkPulse application, built with React, TypeScript, Vite, and Electron.

## Prerequisites

Before starting, ensure you have the correct Node.js version installed. This project uses **Node.js v24.4.1**.

### Using NVM (Node Version Manager)

We recommend using [nvm](https://github.com/nvm-sh/nvm) (Linux/macOS) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage your Node.js versions.

1.  **Install the correct Node version:**
    Navigate to the project root directory and run:
    ```bash
    nvm install
    nvm use
    ```
    This will read the version specified in the `.nvmrc` file (`v24.4.1`) and install/use it.

## Installation

Install the project dependencies using npm:

```bash
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev` / `npm start`

Runs the app in the development mode using Vite.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run electron:dev`

Starts the application in Electron development mode.

### `npm run build`

Builds the app for production. It compiles the TypeScript code, builds the Vite app, and packages it using `electron-builder`.

### `npm run lint`

Runs the linter to check for code quality and style issues.

### `npm run preview`

Locally preview the production build.

## Project Structure

- **src/**: Source code for the React application.
- **electron/**: Main process code for Electron.
- **dist/**: Production build output.

## Dependencies

### Core

- **React**: UI library.
- **TypeScript**: Static type checking.
- **Vite**: Build tool and development server.
- **Electron**: Framework for building desktop applications.

### Key Libraries

- **active-win**: Tracks active window usage (for activity tracking features).
- **axios**: HTTP client for API requests.
- **idb**: IndexedDB wrapper for local storage.
- **lucide-react**: Icon library.
- **react-router-dom**: Routing for React.
- **socket.io-client**: Real-time communication.
- **zustand**: State management.
- **uuid**: Unique ID generation.

## ESLint Configuration

This project includes a comprehensive ESLint configuration for code quality, focusing on React and TypeScript best practices.
