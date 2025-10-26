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

This is a static frontend application. No backend server is required.

**Prerequisites:**
-   An environment where the Google Gemini `API_KEY` is available as `process.env.API_KEY`. In development environments like AI Studio, this is typically pre-configured.

**Steps:**

1.  **Open the application:**
    Simply open the `index.html` file in your web browser. Most code editors (like VS Code or Cursor) have extensions like "Live Server" that make this easy. Right-click on `index.html` and choose "Open with Live Server".

The application will be fully functional as long as the API key is correctly configured in its running environment.

## Troubleshooting

### Error: "API_KEY is not configured..."

This error appears if the application cannot access the Google Gemini API key. Ensure that `process.env.API_KEY` is properly set in the environment where you are running the application.

### Other Errors

If you encounter other errors, check the browser's developer console for more detailed information. This can provide clues about issues with the API call or data processing.
