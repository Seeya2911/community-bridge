# Community Bridge

Community Bridge is a platform designed to connect Non-Governmental Organizations (NGOs) with passionate volunteers. It provides a centralized system for NGOs to post tasks and for volunteers to find and engage in meaningful opportunities. The application features distinct dashboards for different user roles (Admin, NGO, Volunteer), ensuring a tailored and efficient experience for everyone.

This project was built to demonstrate a modern, real-time web application using React and Firebase, with a focus on providing a seamless user experience for managing and participating in community-driven initiatives.

## Key Features

- **Role-Based Access Control**: Separate dashboards and functionalities for three distinct user roles:
    - **Admin**: Oversees the platform, manages tasks, and assigns them to volunteers.
    - **NGO**: Can post new tasks, track their status, and view volunteer activity on an interactive map.
    - **Volunteer**: Can view assigned tasks, update their status, and see their impact.
- **Real-Time Task Management**: Create, update, and assign tasks with changes reflected instantly for all users.
- **Interactive Map View**: NGOs can visualize the geographic distribution of their projects and tasks using an integrated Leaflet map.
- **Live Notifications**: A real-time notification system keeps users informed about important updates and assignments.
- **Demo Mode**: A built-in demo mode allows for easy testing and showcasing of the platform's features without requiring a live Firebase backend configuration. It uses a complete set of mock data to simulate a real-world environment.
- **Responsive Design**: A clean, modern, and responsive UI built with Tailwind CSS.

## Tech Stack

- **Frontend**: React 19, Vite
- **Backend & Database**: Firebase (Firestore for database, Firebase Authentication)
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Mapping**: React-Leaflet
- **UI Components**: Framer Motion for animations, Lucide React for icons.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/community-bridge.git
    cd community-bridge
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    The project uses Firebase for its backend. For full functionality, you'll need to connect it to your own Firebase project.

    - Create a `.env` file in the root of the project.
    - Add your Firebase project configuration keys to the `.env` file. You can copy the format from `.env.example` if it exists, or use the template below:

    ```env
    VITE_FIREBASE_API_KEY="your_api_key"
    VITE_FIREBASE_AUTH_DOMAIN="your_auth_domain"
    VITE_FIREBASE_PROJECT_ID="your_project_id"
    VITE_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
    VITE_FIREBASE_APP_ID="your_app_id"
    ```

    **Note**: If you do not create a `.env` file, the application will automatically run in **Demo Mode** using local mock data.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Demo Accounts

You can use the following credentials to test the different roles within the application. The login page will automatically handle authentication for these demo users.

-   **Admin**:
    -   **Email**: `admin@communitybridge.com`
    -   **Password**: `admin123`
-   **NGO**:
    -   **Email**: `ngo@communitybridge.com`
    -   **Password**: `ngo123`
-   **Volunteer**:
    -   **Email**: `volunteer@communitybridge.com`
    -   **Password**: `volunteer123`

## Project Structure

The project follows a standard Vite + React structure, with key directories organized as follows:

```
/src
|-- /assets         # Static assets like images and icons
|-- /components     # Reusable React components (e.g., buttons, modals, layout elements)
|-- /pages          # Top-level page components corresponding to routes
|-- /utils          # Utility functions (e.g., NLP, data formatting)
|-- App.jsx         # Main application component with routing setup
|-- firebaseStore.js # Firebase initialization and custom state management hook (useStore)
|-- index.css       # Global styles and Tailwind CSS imports
|-- main.jsx        # Application entry point
|-- mockData.js     # Data for the demo mode
```

