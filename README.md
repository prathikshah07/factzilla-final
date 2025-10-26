# Factzilla

Factzilla, your friendly neighborhood fact monster, stomps out misinformation using AI and Google Search.

This project consists of a frontend single-page application and a backend API server.

## Project Structure

-   `/index.html`: The main HTML file for the frontend.
-   `/index.tsx`: The main entry point for the React application.
-   `/App.tsx`: The root React component.
-   `/components`: Contains reusable React components.
-   `/services`: Contains the service that communicates with the backend API.
-   `/api/factcheck.ts`: A simple Node.js/Express server that securely calls the Gemini API.

## Setup & Running the Application

This application requires two parts to be running: the **Backend API** and the **Frontend**.

### 1. Backend API Setup

The backend server is responsible for securely communicating with the Google Gemini API.

**Prerequisites:**
-   Node.js and npm installed.

**Steps:**

1.  **Install Dependencies:**
    Open a terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    Create a file named `.env` in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your Google Gemini API key.
    ```
    API_KEY="YOUR_API_KEY_HERE"
    ```

3.  **Run the API Server:**
    Start the backend server with the following command:
    ```bash
    npm run start:api
    ```
    The server will start on `http://localhost:3000`. Keep this terminal window open. If your API key is not configured correctly, you will see a warning here with instructions.

### 2. Frontend Setup

The frontend is a static site. You just need to serve the `index.html` file. Most code editors (like VS Code or Cursor) have extensions like "Live Server" that can do this easily.

If you are using an editor like Cursor, you can typically right-click on `index.html` and choose "Open with Live Server".

Once both the backend is running and the frontend is open in your browser, the application will be fully functional.

## Troubleshooting

### Error: "Could not connect to the backend server..." or "Failed to fetch"

This error appears on the website when the frontend application cannot communicate with the backend API server.

1.  **Is the backend server running?** Look at the terminal window where you ran `npm run start:api`. It should be running and should not have crashed. If it's not running, start it again.
2.  **Can you access the API directly?** Open your web browser and go to `http://localhost:3000`. You should see the message "Factzilla API server is running!".
    - If you see this message, the server is running correctly. The issue might be related to a browser extension (like an ad-blocker) or a firewall blocking the request. Try disabling them.
    - If you get an error like "This site can’t be reached", the server is definitely not running or is blocked by your system. Go back to step 1.
3.  **Check the console for errors:** Check the terminal running the API server for any error messages that might indicate why it stopped.


### Error: "API_KEY is not configured on the server."

This error means the backend server could not find your Google Gemini API key. Follow these steps to fix it:

1.  **Check for a `.env` file:** Make sure you have a file named exactly `.env` (not `.env.txt` or anything else) in the root of the project directory.
2.  **Check the file content:** Open the `.env` file and ensure it contains the line `API_KEY="YOUR_API_KEY_HERE"`, where `YOUR_API_KEY_HERE` is replaced with your actual key. There should be no extra spaces.
3.  **Restart the server:** After creating or modifying the `.env` file, you **must** stop the backend server (press `Ctrl+C` in the terminal) and restart it with `npm run start:api` for the changes to take effect.
