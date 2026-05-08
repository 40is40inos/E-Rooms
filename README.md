# E-Rooms: Room Management & Reservation System

A full-stack web application designed for managing corporate or hospitality room bookings, employee profiles, and administrative oversight. This project was developed by Sarantis Sarantinos and Kiriaki Dimopoulou as part of the "Analysis and Design of Information Systems" curriculum (HY351).

## 🚀 Overview

E-Rooms is a comprehensive solution for organizations to manage internal space resources. It provides a dual-interface system: a user-facing portal for employees to browse and book rooms, and a powerful administrative dashboard for system oversight.

## ✨ Key Features

### 👤 User Portal
*   **Dynamic Room Filtering:** Filter available rooms based on date range and person capacity.
*   **Interactive Booking Calendar:** Integrated `FullCalendar` support to view room availability in real-time.
*   **Reservation Management:** Track booking history and status (Accepted, Active, Done).
*   **Review System:** Users can provide feedback and ratings for rooms.
*   **Notification Engine:** Real-time updates on booking confirmations and system alerts.
*   **Profile Management:** Secure personal information updates for employees.

### 🛡️ Administrative Dashboard
*   **Employee CRUD:** Full lifecycle management of employee profiles and credentials.
*   **Room Catalog Management:** Add, edit, or remove rooms, including capacity constraints and multimedia assets.
*   **Reservation Oversight:** Centralized view of all system-wide bookings with administrative control.
*   **Automated Status Handling:** Intelligent backend logic that transitions reservation states based on current dates.

## 🛠️ Technical Stack

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite3 (Relational storage with complex triggers and state updates)
*   **Frontend:** Vanilla JavaScript, HTML5, CSS3, Bootstrap 4
*   **Communication:** Nodemailer (Email integration)
*   **Data Visualization:** FullCalendar, Moment.js

## 📂 Project Structure

```text
E-Rooms-master/
├── server.js           # Monolithic Express server & SQLite logic
├── e-rooms.db          # SQLite Database file
├── Home.html           # Main User Portal
├── Admin.html          # Administrative Dashboard
├── Login.html          # Authentication entry point
├── home_script.js      # Client-side logic for User Portal
├── admin_script.js     # Client-side logic for Admin Dashboard
├── style.css           # Global application styling
└── package.json        # Dependencies and project metadata
```

## ⚙️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v14 or higher recommended)
*   npm (comes with Node.js)

### Steps
1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd E-Rooms-master
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in `server.js`).

## 📝 License

This project was developed by Sarantis Sarantinos and Kiriaki Dimopoulou for academic purposes under the HY351 course.
