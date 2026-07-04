// ===================================
// Neuro Diagnosis - UI Feedback & Loading States
// ===================================

/**
 * Show loading overlay with spinner and message
 * @param {string} message - Loading message to display
 */
function showLoading(message = 'Processing...') {
    // Remove existing loading overlay if present
    hideLoading();

    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'nd-loading-overlay';
    overlay.className = 'nd-loading-overlay';
    overlay.innerHTML = `
        <div class="nd-loading-content">
            <div class="nd-loading-logo">
                <i class="bi bi-brain" style="font-size: 3rem; color: #2563eb;"></i>
                <h4 class="fw-bold mt-2" style="color: #2563eb;">Neuro Diagnosis</h4>
            </div>
            <div class="nd-spinner"></div>
            <p class="nd-loading-text">${message}</p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('nd-loading-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Show alert notification
 * @param {string} message - Alert message
 * @param {string} type - Alert type: 'success', 'error', 'info', 'warning'
 */
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.nd-alert-notification');
    existingAlerts.forEach(alert => alert.remove());

    // Determine alert styling based on type
    let bgColor, iconClass, borderColor;
    switch (type) {
        case 'success':
            bgColor = '#10b981';
            iconClass = 'bi-check-circle-fill';
            borderColor = '#059669';
            break;
        case 'error':
            bgColor = '#ef4444';
            iconClass = 'bi-x-circle-fill';
            borderColor = '#dc2626';
            break;
        case 'warning':
            bgColor = '#f59e0b';
            iconClass = 'bi-exclamation-triangle-fill';
            borderColor = '#d97706';
            break;
        case 'info':
        default:
            bgColor = '#2563eb';
            iconClass = 'bi-info-circle-fill';
            borderColor = '#1e40af';
            break;
    }

    // Create alert element
    const alert = document.createElement('div');
    alert.className = 'nd-alert-notification';
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 500px;
        animation: nd-slideDown 0.3s ease-out;
        border-left: 4px solid ${borderColor};
    `;

    alert.innerHTML = `
        <i class="bi ${iconClass}" style="font-size: 1.5rem;"></i>
        <span style="flex: 1; font-weight: 500;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.25rem; padding: 0; opacity: 0.8;">
            <i class="bi bi-x"></i>
        </button>
    `;

    document.body.appendChild(alert);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alert && alert.parentElement) {
            alert.style.animation = 'nd-slideUp 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }
    }, 3000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid file type
 */
function validateFileType(file, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']) {
    return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {boolean} True if file size is within limit
 */
function validateFileSize(file, maxSizeMB = 5) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Validate login form
 * @param {string} email - Email input
 * @param {string} password - Password input
 * @returns {Object} Validation result with isValid and message
 */
function validateLoginForm(email, password) {
    if (!email || !password) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - Please fill in all fields'
        };
    }

    if (!validateEmail(email)) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - Please enter a valid email address'
        };
    }

    if (password.length < 6) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - Password must be at least 6 characters'
        };
    }

    return {
        isValid: true,
        message: 'Valid'
    };
}

/**
 * Validate uploaded file
 * @param {File} file - File to validate
 * @returns {Object} Validation result with isValid and message
 */
function validateUploadedFile(file) {
    if (!file) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - Please select a file'
        };
    }

    if (!validateFileType(file)) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - Invalid file format. Please upload JPG or PNG files only'
        };
    }

    if (!validateFileSize(file, 5)) {
        return {
            isValid: false,
            message: 'Neuro Diagnosis - File size exceeds 5MB limit. Please upload a smaller file'
        };
    }

    return {
        isValid: true,
        message: 'Valid'
    };
}

/**
 * Show confirmation dialog
 * @param {string} message - Confirmation message
 * @returns {boolean} True if user confirms
 */
function showConfirmation(message) {
    return confirm(message);
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Add form validation to login forms
 */
function initializeLoginFormValidation() {
    const loginForms = document.querySelectorAll('form[id*="Login"]');

    loginForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');
            const passwordInput = form.querySelector('input[type="password"]');

            if (emailInput && passwordInput) {
                const validation = validateLoginForm(emailInput.value, passwordInput.value);

                if (!validation.isValid) {
                    showAlert(validation.message, 'error');
                    return false;
                }
            }

            // If validation passes, submit the form
            form.submit();
        });
    });
}

/**
 * Add CSS animations for alerts
 */
function addAlertAnimations() {
    if (!document.getElementById('nd-alert-animations')) {
        const style = document.createElement('style');
        style.id = 'nd-alert-animations';
        style.textContent = `
            @keyframes nd-slideDown {
                from {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
            
            @keyframes nd-slideUp {
                from {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -20px);
                }
            }
            
            .nd-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .nd-loading-content {
                text-align: center;
            }
            
            .nd-loading-logo {
                margin-bottom: 2rem;
            }
            
            .nd-spinner {
                width: 80px;
                height: 80px;
                border: 6px solid #e2e8f0;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: nd-spin 1s linear infinite;
                margin: 0 auto 1.5rem;
            }
            
            @keyframes nd-spin {
                to { transform: rotate(360deg); }
            }
            
            .nd-loading-text {
                font-size: 1.25rem;
                font-weight: 600;
                color: #2563eb;
                animation: nd-pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes nd-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    addAlertAnimations();
    initializeLoginFormValidation();
});

// ===================================
// Export functions for use in other files
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        showAlert,
        validateEmail,
        validateFileType,
        validateFileSize,
        validateLoginForm,
        validateUploadedFile,
        showConfirmation,
        formatFileSize
    };
}
