# Factzilla

Factzilla, your friendly neighborhood fact monster, stomps out misinformation using AI and Google Search.

This project is a full-stack application with a static frontend and a Node.js backend server that are run from a single command.

## Project Structure

-   `/index.html`: The main HTML file for the frontend.
-   `/index.tsx`: The main entry point for the React application.
-   `/App.tsx`: The root React component containing the application logic.
-   `/api/factcheck.ts`: The Node.js Express server that handles API requests and serves the frontend.
-   `/services/geminiService.ts`: The backend service that communicates with the Google Gemini API.
-   `/components`: Contains reusable React components.
-   `/types.ts`: Contains shared TypeScript type definitions.

## Running the Application

The Node.js server handles both the backend API and serving the frontend application, so you only need to run one process.

**Prerequisites:**
-   Node.js and npm installed.
-   A Google Gemini `API_KEY`.

### Setup and Run

1.  **Set up your API Key:**
    The server expects the `API_KEY` to be available as an environment variable. In development environments like AI Studio, this is typically pre-configured.

2.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

3.  **Start the Application:**
    Run the following command to start the server:
    ```bash
    npm start
    ```
    You should see a message confirming that the server is running on `http://localhost:3000`.

4.  **View the Application:**
    Open your web browser and navigate to `http://localhost:3000`.

The application is now fully functional. The frontend served from the server will make requests to the API on the same server.
