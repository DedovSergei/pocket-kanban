# Pocket Kanban

A real-time, full-stack kanban board (like a simple Trello clone) built with React, Node.js, and TypeScript.

This project features persistent drag-and-drop for columns and cards, with all changes synced live across multiple clients using Socket.IO.

## Features

* **Real-Time Sync:** Changes made in one window (like creating, dragging, or renaming) appear instantly in any other open window.
* **Drag & Drop:** You can drag and drop both cards and columns. The new order is saved in the database.
* **Full CRUD:**
    * **Boards:** Create and delete boards from the main page.
    * **Columns:** Create, rename, and delete columns.
    * **Cards:** Create, rename, and delete cards.
* **Persistent Storage:** Everything is saved in a MongoDB database.

## Tech Stack

* **Monorepo:** Managed with npm workspaces (`packages/client` and `packages/server`).
* **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB), Socket.IO.
* **Frontend:** React, TypeScript, Vite, `react-beautiful-dnd`, `socket.io-client`.
* **Styling:** CSS Modules.

## How to Run Locally

You'll need two terminals to run the project.

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/DedovSergei/pocket-kanban.git](https://github.com/DedovSergei/pocket-kanban.git)
    cd pocket-kanban
    ```

2.  **Install dependencies:**
    * From the root folder, run `npm install`. This installs everything for both the client and server.

3.  **Set up the Database:**
    * Go to the server: `cd packages/server`
    * Create a file named `.env`.
    * Add your MongoDB Atlas connection string to it:
        `MONGO_URL="your-connection-string-goes-here"`

4.  **Run the Backend:**
    ```bash
    # From the root folder
    npm run dev --workspace=server
    ```

5.  **Run the Frontend:**
    ```bash
    # From the root folder, in a new terminal
    npm run dev --workspace=client
    ```

6.  Open `http://localhost:5173` in your browser.
