# Project Instructions

## Overview
This is a client-only TypeScript website using Vite for building and deploying to GitHub Pages. The site simulates a 3D dice tower using Three.js and Cannon.js physics engine.

## Tech Stack
- TypeScript
- Vite (build tool)
- Three.js (3D rendering)
- Cannon.js (physics simulation)
- GitHub Actions (CI/CD)

## Development
- Run `npm run dev` to start the development server
- Run `npm run build` to build for production
- Run `npm run preview` to preview the production build

## Project Structure
- `index.html` - Main HTML file with canvas element
- `src/main.ts` - Main TypeScript entry point with Three.js and Cannon.js setup
- `src/style.css` - Styles for the application
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deployment
- `vite.config.ts` - Vite configuration with base path for GitHub Pages

## Deployment
The project automatically deploys to GitHub Pages when pushing to the main branch. Ensure GitHub Pages is configured to use GitHub Actions in repository settings.

