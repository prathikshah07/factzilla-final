# Factzilla

Factzilla, your friendly neighborhood fact monster, stomps out misinformation using AI and Google Search.

This is a self-contained, single-page web application that runs entirely in your browser.

## Project Structure

-   `/index.html`: The main HTML file for the frontend.
-   `/index.tsx`: The main entry point for the React application.
-   `/App.tsx`: The root React component containing the application logic.
-   `/components`: Contains reusable React components.
-   `/types.ts`: Contains TypeScript type definitions.

## Running the Application

This is a static frontend application. No backend server or build step is required.

**Prerequisites:**
-   An environment where the Google Gemini `API_KEY` is available as `process.env.API_KEY`. In development environments like AI Studio, this is typically pre-configured.

**Steps:**

1.  **Open the application:**
    Simply open the `index.html` file in your web browser. Most code editors (like VS Code) have extensions like "Live Server" that make this easy. Right-click on `index.html` and choose "Open with Live Server".

The application will be fully functional as long as the API key is correctly configured in its running environment.

## Deployment

This is a fully static web application. **It does not have a build step.** To deploy it, you only need to serve the static files (`index.html`, `index.tsx`, etc.).

**IMPORTANT:** Some platforms might try to run a build command (like `vite build` or `npm install`) because they detect a `package.json` file. This project does not need a build step. If your deployment platform is failing on a build command, configure it to simply serve the files as-is, without running any build commands.
