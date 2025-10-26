# Factzilla

Factzilla, your friendly neighborhood fact monster, stomps out misinformation using AI and Google Search.

This project is built as a modern web application with a static React frontend and a serverless backend, optimized for deployment on [Vercel](https://vercel.com).

## Project Structure

-   `/index.html`: The main HTML file for the frontend.
-   `/index.tsx`: The main entry point for the React application.
-   `/App.tsx`: The root React component containing the application logic.
-   `/api/factcheck.ts`: The Vercel Serverless Function that handles API requests.
-   `/services/geminiService.ts`: The backend service that communicates with the Google Gemini API.
-   `/vercel.json`: Configuration file that tells Vercel how to build and route the application.

## Running the Application

This project is designed to be run and deployed with the Vercel platform and its command-line interface (CLI).

**Prerequisites:**
-   Node.js and npm installed.
-   [Vercel CLI installed](https://vercel.com/docs/cli) (`npm install -g vercel`).
-   A Google Gemini `API_KEY`.

### 1. Local Development

Using the Vercel CLI for local development ensures that your environment perfectly mirrors the production environment on Vercel.

1.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Set Up Local Environment Variables:**
    Create a file named `.env.development.local` in the project root and add your API key:
    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```

3.  **Start the Development Server:**
    Run the following command:
    ```bash
    vercel dev
    ```
    The Vercel CLI will start a local server (usually on `http://localhost:3000`) that runs your frontend and your serverless function together, just like in production.

### 2. Deployment to Vercel

1.  **Connect Your Project to Vercel:**
    If you haven't already, run `vercel` to connect your local project to your Vercel account.

2.  **Set Production Environment Variables:**
    You must add your Gemini API key to your project's settings on the Vercel dashboard.
    ```bash
    vercel env add API_KEY
    ```
    Vercel will securely prompt you for the key value. This key will be available to your serverless function in production.

3.  **Deploy:**
    Deploy your application to production by running:
    ```bash
    vercel --prod
    ```
    Vercel will build your application and deploy it, providing you with a live URL.
