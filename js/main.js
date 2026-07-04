/**
 * ===================================
 * Neuro Diagnosis - Main Application Logic
 * ===================================
 * 
 * This file contains the core functionality for the Neuro Diagnosis
 * brain tumor detection system. It handles session management,
 * user authentication simulation, and utility functions.
 * 
 * PRODUCTION NOTE: In a real deployment, this would connect to a
 * backend API for actual authentication and data persistence.
 */

// ===================================
// Initialization
// ===================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('Neuro Diagnosis System Initialized');

    // Add smooth scrolling
    initSmoothScroll();

    // Add fade-in animations
    initAnimations();
});

// ===================================
// Smooth Scrolling
// ===================================

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Animations
// ===================================

/**
 * Initialize intersection observer for fade-in animations
 */
function initAnimations() {
    const elements = document.querySelectorAll('.feature-card, .stat-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        observer.observe(element);
    });
}

// ===================================
// Session Management
// ===================================
// PRODUCTION NOTE: Replace sessionStorage with JWT tokens
// and secure HTTP-only cookies for real authentication

/**
 * Store user session (mock authentication)
 * @param {string} userType - Type of user ('patient' or 'doctor')
 * @param {Object} userData - User data object
 */
function setUserSession(userType, userData) {
    sessionStorage.setItem('userType', userType);
    sessionStorage.setItem('userData', JSON.stringify(userData));
}

/**
 * Get current user session
 * @returns {Object} Session object with userType and userData
 */
function getUserSession() {
    return {
        userType: sessionStorage.getItem('userType'),
        userData: JSON.parse(sessionStorage.getItem('userData') || '{}')
    };
}

/**
 * Clear user session (logout)
 */
function clearUserSession() {
    sessionStorage.clear();
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function isLoggedIn() {
    return sessionStorage.getItem('userType') !== null;
}

/**
 * Logout function
 * Clears session and redirects to home page
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearUserSession();
        window.location.href = 'index.html';
    }
}

// ===================================
// Notification Management System
// ===================================

/**
 * Add a new notification for a specific user
 * @param {string} userEmail - Target user's email
 * @param {string} message - Notification text
 * @param {string} type - 'info', 'success', 'warning'
 */
function addNotification(userEmail, message, type = 'info') {
    const notifications = JSON.parse(localStorage.getItem(`notifications_${userEmail}`) || '[]');
    notifications.unshift({
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifications));
    console.log(`Notification added for ${userEmail}: ${message}`);
}

/**
 * Get all notifications for a specific user
 * @param {string} userEmail - User's email
 * @returns {Array} Array of notification objects
 */
function getNotifications(userEmail) {
    return JSON.parse(localStorage.getItem(`notifications_${userEmail}`) || '[]');
}

/**
 * Mark all notifications as read for a user
 * @param {string} userEmail - User's email
 */
function markNotificationsRead(userEmail) {
    const notifications = getNotifications(userEmail);
    notifications.forEach(n => n.read = true);
    localStorage.setItem(`notifications_${userEmail}`, JSON.stringify(notifications));
}

/**
 * Clear all notifications for a user
 * @param {string} userEmail - User's email
 */
function clearNotifications(userEmail) {
    localStorage.removeItem(`notifications_${userEmail}`);
}

/**
 * Global function to render notifications in the navbar
 * This should be called on every dashboard page load
 */
function updateNotificationUI() {
    const session = getUserSession();
    if (!session || !session.userData || !session.userData.email) return;

    const email = session.userData.email;
    const notifications = getNotifications(email);
    const unreadCount = notifications.filter(n => !n.read).length;

    const badge = document.getElementById('notificationBadge');
    const list = document.getElementById('notificationList');

    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (list) {
        if (notifications.length === 0) {
            list.innerHTML = '<li><span class="dropdown-item text-muted small py-3">No new notifications</span></li>';
            return;
        }

        list.innerHTML = notifications.map(n => `
            <li>
                <div class="dropdown-item py-2 border-bottom ${n.read ? 'opacity-75' : 'bg-light'}">
                    <p class="mb-0 small fw-bold text-dark">${n.message}</p>
                    <small class="text-muted" style="font-size: 0.7rem;">
                        ${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                </div>
            </li>
        `).join('');

        // Add a "Clear All" button if there are notifications
        list.innerHTML += `
            <li class="p-2 text-center border-top">
                <button class="btn btn-link btn-sm text-decoration-none text-danger" onclick="clearUserNotifications()">
                    Clear All
                </button>
            </li>
        `;
    }
}

/**
 * Helper to clear notifications from the UI
 */
function clearUserNotifications() {
    const session = getUserSession();
    if (session.userData.email) {
        clearNotifications(session.userData.email);
        updateNotificationUI();
    }
}

// ===================================
// Alert Notifications
// ===================================

/**
 * Show alert notification to user
 * NOTE: The full-featured version is in ui-feedback.js (with animations & custom styling).
 * This fallback is only used on pages that don't load ui-feedback.js.
 * @param {string} message - Alert message
 * @param {string} type - Alert type ('success', 'info', 'warning', 'danger', 'error')
 */
if (typeof window.showAlert === 'undefined') {
    window.showAlert = function(message, type = 'info') {
        // Map 'error' to 'danger' for Bootstrap compatibility
        if (type === 'error') type = 'danger';
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => { alertDiv.remove(); }, 5000);
    };
}

// ===================================
// PRODUCTION NOTES
// ===================================

/**
 * BACKEND API INTEGRATION POINTS:
 * 
 * 1. User Authentication:
 *    - POST /api/auth/login
 *    - POST /api/auth/logout
 *    - POST /api/auth/register
 * 
 * 2. Scan Upload:
 *    - POST /api/scans/upload
 *    - File upload with multipart/form-data
 *    - Returns scan ID for tracking
 * 
 * 3. Scan Analysis:
 *    - POST /api/scans/analyze
 *    - Sends image to ResNet50 model
 *    - Generates Grad-CAM heatmap
 *    - Returns prediction and confidence
 * 
 * 4. Results Retrieval:
 *    - GET /api/scans/{scanId}/results
 *    - Returns analysis results and images
 * 
 * 5. Patient Management:
 *    - GET /api/patients
 *    - GET /api/patients/{patientId}
 *    - PUT /api/patients/{patientId}
 * 
 * 6. Doctor Notes:
 *    - POST /api/scans/{scanId}/notes
 *    - PUT /api/scans/{scanId}/notes
 * 
 * Example API call structure:
 * 
 * async function uploadScan(file) {
 *     const formData = new FormData();
 *     formData.append('scan', file);
 *     
 *     6980
 * ('/api/scans/upload', {
 *         method: 'POST',
 *         headers: {
 *             'Authorization': `Bearer ${getAuthToken()}`
 *         },
 *         body: formData
 *     });
 *     
 *     return await response.json();
 * }
 */

/**
 * IMAGE STORAGE NOTES:
 * 
 * Real MRI scans and Grad-CAM heatmaps should be placed in:
 * /images/sample_mri_1.jpg    - Actual MRI scan from your dataset
 * /images/heatmap_1.jpg        - Corresponding Grad-CAM output
 * 
 * See SETUP-IMAGES.md for detailed instructions on:
 * - Generating Grad-CAM heatmaps from your trained model
 * - Proper image naming conventions
 * - Image quality requirements
 * - Watermarking for public presentations
 */

/**
 * MODEL DEPLOYMENT NOTES:
 * 
 * For production deployment:
 * 1. Export trained ResNet50 model to TensorFlow SavedModel format
 * 2. Deploy using TensorFlow Serving or Flask API
 * 3. Implement image preprocessing pipeline (resize, normalize)
 * 4. Generate Grad-CAM on server-side
 * 5. Return both prediction and heatmap to frontend
 * 
 * Example Python backend (Flask):
 * 
 * @app.route('/api/scans/analyze', methods=['POST'])
 * def analyze_scan():
 *     file = request.files['scan']
 *     img = preprocess_image(file)
 *     prediction = model.predict(img)
 *     heatmap = generate_gradcam(model, img)
 *     return jsonify({
 *         'result': 'Tumor Detected' if prediction > 0.5 else 'No Tumor',
 *         'confidence': float(prediction),
 *         'heatmap': encode_image(heatmap)
 *     })
 */

// ===================================
// Mock Data Simulation for Demo
// ===================================

/**
 * Simulates fetching analysis results from the backend API.
 */
function mockFetchScanDetails(scanId) {
    console.log(`Simulating fetch for scan ID: ${scanId}`);

    // Mock response structure - Customize these file names to match your 'images/' folder
    const mockResponse = {
        scanId: scanId,
        patientName: 'Ahmad Khan',
        patientId: 'PT-2025-456',
        age: 45,
        scanDate: 'November 20, 2025',
        mriUrl: 'images/sample_mri_1.jpg', 
        heatmapUrl: 'images/heatmap_1.jpg',
        diagnosis: 'Tumor Detected',
        confidence: 0.875,
        processingTime: 2.3
    };

    return new Promise(resolve => {
        // Simulate a network delay (1.5 seconds)
        setTimeout(() => {
            resolve(mockResponse);
        }, 1500); 
    });
}

/**
 * Compresses a base64 Image DataURL to a specified max dimension and quality
 * @param {string} dataUrl - The original base64 DataURL
 * @param {number} maxDim - The maximum width or height
 * @param {number} quality - JPEG quality from 0.0 to 1.0
 * @returns {Promise<string>} Promise resolving to the compressed DataURL
 */
function compressImage(dataUrl, maxDim = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            let w = img.width;
            let h = img.height;

            // Scale down if larger than maxDim
            if (w > maxDim || h > maxDim) {
                if (w > h) {
                    h = Math.round(h * maxDim / w);
                    w = maxDim;
                } else {
                    w = Math.round(w * maxDim / h);
                    h = maxDim;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            try {
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = function (err) {
            reject(err);
        };
        img.src = dataUrl;
    });
}

/**
 * Safely saves the pending scans list to localStorage.
 * If storage quota is exceeded, it removes/strips image data from older reviewed scans
 * and, if needed, evicts the oldest scans until it fits.
 * @param {Array} scans - The array of scan objects to save
 * @returns {boolean} True if successfully saved
 */
function safeSavePendingScans(scans) {
    const key = 'pendingScans';
    try {
        localStorage.setItem(key, JSON.stringify(scans));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('LocalStorage quota exceeded. Attempting to free space...');
            
            // Try 1: Strip heavy image data ('image' and 'gradcam') from reviewed scans, keeping metadata.
            let modified = false;
            for (let i = 0; i < scans.length; i++) {
                if (scans[i].status === 'reviewed' && (scans[i].image || scans[i].gradcam)) {
                    scans[i].image = ''; // Strip heavy image base64
                    scans[i].gradcam = ''; // Strip heavy heatmap base64
                    modified = true;
                }
            }

            if (modified) {
                try {
                    localStorage.setItem(key, JSON.stringify(scans));
                    console.log('Successfully saved scans after stripping image data from reviewed ones.');
                    return true;
                } catch (e2) {
                    console.warn('Still exceeding quota after stripping reviewed scans. Evicting oldest reviewed scans...');
                }
            }

            // Try 2: Evict older reviewed scans completely
            let reviewedScans = scans.filter(s => s.status === 'reviewed');
            // Sort by date ascending (oldest first)
            reviewedScans.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));

            for (let rScan of reviewedScans) {
                const idx = scans.findIndex(s => s.scanId === rScan.scanId);
                if (idx !== -1) {
                    scans.splice(idx, 1); // remove oldest reviewed scan
                    try {
                        localStorage.setItem(key, JSON.stringify(scans));
                        console.log('Successfully saved scans after evicting oldest reviewed scan:', rScan.scanId);
                        return true;
                    } catch (e3) {
                        // continue evicting
                    }
                }
            }

            // Try 3: Evict any oldest scans (even unreviewed) if still blocked
            let sortedScans = [...scans].sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
            for (let oldScan of sortedScans) {
                const idx = scans.findIndex(s => s.scanId === oldScan.scanId);
                if (idx !== -1) {
                    scans.splice(idx, 1);
                    try {
                        localStorage.setItem(key, JSON.stringify(scans));
                        console.log('Successfully saved scans after evicting scan:', oldScan.scanId);
                        return true;
                    } catch (e4) {
                        // continue evicting
                    }
                }
            }
        }
        console.error('Failed to save scans to localStorage even after cleaning up:', e);
        return false;
    }
}
