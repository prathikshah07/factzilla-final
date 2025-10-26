# Factzilla

Factzilla, your friendly neighborhood fact monster, stomps out misinformation using AI and Google Search.

This project consists of a static frontend and a Node.js backend server.

## Project Structure

-   `/index.html`: The main HTML file for the frontend.
-   `/index.tsx`: The main entry point for the React application.
-   `/App.tsx`: The root React component containing the application logic.
-   `/api/factcheck.ts`: The Node.js Express server that handles API requests.
-   `/services/geminiService.ts`: The backend service that communicates with the Google Gemini API.
-   `/components`: Contains reusable React components.
-   `/types.ts`: Contains shared TypeScript type definitions.

## Running the Application

This application has two parts: the backend server and the frontend client. You need to run both for the application to work.

**Prerequisites:**
-   Node.js and npm installed.
-   A Google Gemini `API_KEY`.

### 1. Backend Setup & Run

The backend server handles the secure communication with the Google Gemini API.

1.  **Set up your API Key:**
    The server expects the `API_KEY` to be available as an environment variable. In development environments like AI Studio, this is typically pre-configured.

2.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

3.  **Start the Server:**
    Run the following command to start the backend server:
    ```bash
    npm start
    ```
    You should see a message confirming that the server is running on `http://localhost:3000`.

### 2. Frontend Setup & Run

The frontend is a static application that communicates with your running backend server.

1.  **Open the application:**
    Simply open the `index.html` file in your web browser. Most code editors (like VS Code) have extensions like "Live Server" that make this easy. Right-click on `index.html` and choose "Open with Live Server".

The application will now be fully functional. The frontend will make requests to the backend server you started in the previous step.
