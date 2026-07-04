# Neuro Diagnosis System - Full Working Guide & UI Architecture

This document provides a comprehensive step-by-step breakdown of how the Neuro Diagnosis web application is currently structured, how the data flows, and how the User Interface (UI) functions in its current state.

## 1. System Architecture Overview

The system is designed as a **Frontend Web Application** with simulated session management and partial backend API integration.

*   **Frontend Technologies**: HTML5, CSS3, Bootstrap 5 (for responsive layouts and components), and Vanilla JavaScript.
*   **State Management**: It relies heavily on `sessionStorage` to pass data between pages (e.g., passing the uploaded image and prediction results from the dashboard to the results page) and `localStorage` to persist notifications.
*   **Backend Integration**: The application makes actual HTTP `fetch` requests to a Python/Flask backend running at `http://localhost:5000` specifically for the AI prediction phase (`/api/predict`).
*   **Exporting Data**: The app uses a third-party library (`html2pdf.js`) to capture the DOM and generate a downloadable high-definition PDF medical report.

---

## 2. Step-by-Step Patient Workflow

This is the exact sequence of events when a patient interacts with the current UI.

### Step 1: Landing & Authentication (`index.html` → `patient-login.html`)
1.  The user arrives at the `index.html` landing page and clicks on **"Patient Portal"**.
2.  They are directed to `patient-login.html` (or register).
3.  Upon submitting the form, `js/main.js` validates the input and stores the user's session data (name, email, `userType = 'patient'`) into the browser's `sessionStorage`.
4.  The user is successfully authenticated and redirected to the Patient Dashboard.

### Step 2: Uploading the Scan (`patient-dashboard.html`)
1.  **The UI:** The dashboard presents a drag-and-drop zone built with Bootstrap cards. It greets the user using the name stored in `sessionStorage`.
2.  **File Selection:** The user drops an image or clicks "Browse Files" to upload an MRI scan.
3.  **Validation:** The JavaScript checks if the file is a JPG/PNG and under 5MB.
4.  **Preview:** `FileReader` converts the file to a base64 string, showing an immediate preview on the UI, and saving this string to `sessionStorage` as `uploadedImage`.
5.  **Submission:** The user clicks **"Analyze Scan"**. The UI hides the upload box and displays a "Loading" spinner overlay.
6.  **Backend Call:** A `FormData` object containing the image file is sent via a POST request to `http://localhost:5000/api/predict`.

### Step 3: Viewing Results (`patient-results-new.html`)
1.  **Data Retrieval:** If the Flask backend returns a successful prediction, it sends back data like `predicted_class`, `confidence_percentage`, and `all_probabilities`. These are temporarily stored in `sessionStorage`.
2.  **Rendering the UI:**
    *   The page reads the session data. If no data exists, it redirects the user back to the upload page.
    *   It renders the uploaded base64 image on the left.
    *   It renders the analysis details on the right (Scan ID, Date, Confidence Level).
3.  **Dynamic Result Card:**
    *   If the backend returned a tumor class (e.g., `glioma_tumor`), the UI generates a **Red** warning card highlighting the specific tumor type and provides a list of recommended next steps (e.g., "Consult a Neurologist").
    *   If the backend returned `no_tumor`, the UI generates a **Green** success card indicating "No Tumor Detected".
4.  **Downloading the Report:**
    *   When the user clicks "Download Report", a hidden Bootstrap Modal pops up displaying an official "Medical Report" template.
    *   This template pulls the Patient Info, AI Findings, and any existing "Doctor Assessment" notes from `sessionStorage`.
    *   The `html2pdf.js` library captures this HTML modal and triggers a PDF download to the user's local machine.

---

## 3. Step-by-Step Doctor Workflow

### Step 1: Authentication (`doctor-login.html`)
1.  Similar to the patient, the doctor logs in. Their session is stored with `userType = 'doctor'`, giving them access to the clinical side of the portal.
2.  They are redirected to `doctor-dashboard.html`.

### Step 2: Pending Scans (`doctor-dashboard.html` & `doctor-pending.html`)
1.  **The UI:** The dashboard provides statistical overview cards (e.g., Total Scans, Pending Reviews, Completed). 
2.  The doctor navigates to a list of pending patient scans that require clinical review. (Currently driven by mock data in `js/mock-data.js` or `localStorage`).

### Step 3: Clinical Review (`doctor-review.html`)
1.  **The UI:** This is a split-screen view. On one side, the doctor sees the Patient's original MRI scan and the AI-generated Heatmap (Grad-CAM) side-by-side. On the other side, they see the AI's prediction.
2.  **Assessment:** The doctor has a text area to write their clinical notes and verify or override the AI's prediction.
3.  **Submission:** When the doctor submits their review, the system saves the clinical notes to `sessionStorage` (as `doctorAssessment`).
4.  **Notification:** The system creates a local notification for the patient indicating their scan has been officially reviewed.

---

## 4. UI Components & Feedback Mechanisms

*   **Navigation & Notifications:** The top Navbar contains a bell icon. Clicking it triggers `updateNotificationUI()` in `js/main.js`, which reads from `localStorage` to display unread system messages.
*   **Alerts (`showAlert`):** Errors (like a failed backend connection) or success messages trigger a custom JavaScript function that injects a Bootstrap Alert (`<div class="alert alert-danger fade show">`) at the top center of the screen. It automatically dismisses after 5 seconds.
*   **Animations:** The UI makes use of CSS animations defined in `css/animations.css`. Elements like the result cards use `animate-fadeInUp` and `animate-scaleIn` classes to smoothly slide into view when the page loads, giving the application a modern, responsive feel.

## 5. Current System Limitations (What needs real implementation)
1.  **True Authentication:** Passwords are not currently hashed or verified securely. It relies purely on the frontend trusting the user.
2.  **Database Persistence:** Since it uses `sessionStorage`, all data is lost if the user closes the browser tab. In a production environment, scans, users, and results must be saved to a database (e.g., MongoDB, PostgreSQL) via the backend API.
3.  **Doctor-Patient Sync:** Currently, because the data lives in the local browser session, a Doctor on Computer A cannot actually see the scan uploaded by a Patient on Computer B. A centralized backend database is required to bridge this gap.
