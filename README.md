# Dice Tower Simulator

A 3D dice tower simulator built with TypeScript, Three.js, and Cannon.js physics engine.

## Features

- 3D rendered dice tower with realistic physics
- Interactive dice rolling
- Shadows and lighting effects
- Responsive design

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Three.js** - 3D rendering library
- **Cannon-es** - Physics engine for realistic dice behavior

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

This project is configured to deploy to GitHub Pages automatically via GitHub Actions when you push to the `main` branch.

### Setup GitHub Pages

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Source**, select **GitHub Actions**

The site will be available at `https://<username>.github.io/dice-tower/`

## How to Use

1. Click the "Roll Dice" button to drop a die into the tower
2. Watch as it tumbles down the ramps with realistic physics
3. The die will settle on the ground showing a random face

## License

MIT
