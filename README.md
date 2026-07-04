# Neuro Diagnosis - Brain Tumor Detection System

![Neuro Diagnosis](https://img.shields.io/badge/Status-Demo-blue) ![Version](https://img.shields.io/badge/Version-1.0-green) ![License](https://img.shields.io/badge/License-Educational-orange)

## 📋 Project Description

**Neuro Diagnosis** is an AI-powered brain tumor detection system designed to assist medical professionals in analyzing MRI brain scans. This web-based application uses deep learning (ResNet50 Transfer Learning) combined with Grad-CAM explainability to detect potential brain tumors and provide visual explanations of the AI's decision-making process.

This is a **Final Year Project (FYP)** demonstrating the integration of machine learning models with a professional web interface for medical diagnostics.

## 🎯 Purpose

- Demonstrate the application of deep learning in medical imaging
- Provide an intuitive interface for both patients and doctors
- Showcase AI explainability through Grad-CAM visualizations
- Create a complete end-to-end system from upload to diagnosis

## ✨ Features

### Patient Portal

- ✅ Secure login system (demo)
- ✅ Upload MRI brain scans (JPG/PNG, max 5MB)
- ✅ Real-time scan analysis with AI
- ✅ View detailed results with Grad-CAM heatmaps
- ✅ Download analysis reports (demo)
- ✅ Track scan history and results

### Doctor Portal

- ✅ Professional dashboard with analytics
- ✅ View patient scan queue
- ✅ Detailed scan review interface
- ✅ Model performance metrics display
- ✅ Add clinical notes to patient records
- ✅ Interactive charts and statistics
- ✅ Grad-CAM explainability visualization

### Technical Features

- ✅ ResNet50 Transfer Learning model
- ✅ Grad-CAM activation maps for explainability
- ✅ Responsive design (mobile & desktop)
- ✅ Real-time file validation
- ✅ Loading states and user feedback
- ✅ Session management
- ✅ Professional medical UI/UX

## 🚀 How to Run

### Backend Setup (Flask API)

1. **Start the Flask backend server**:

   ```bash
   python app.py
   ```

   The backend will run on `http://localhost:5000`

2. **Verify the backend is running**:
   - Open browser and visit: `http://localhost:5000/api/health`
   - You should see a health check response

### Frontend Setup

1. **Navigate** to the project folder
2. **Open** `index.html` in your web browser (Chrome, Firefox, Edge, Safari)
3. **Choose** your portal:
   - Click **"Patient Login"** to access patient features
   - Click **"Doctor Login"** to access doctor features
4. **Login** with any email/password (authentication is simulated)
5. **Upload an MRI scan** and get real AI predictions!

### Quick Start

```bash
# Step 1: Start Flask backend
python app.py

# Step 2: Open frontend in browser
# On Windows:
start index.html

# On Mac:
open index.html

# On Linux:
xdg-open index.html
```

## 💻 Technology Stack

### Frontend

- **HTML5** - Structure and content
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Application logic with async/await
- **Bootstrap 5** - Responsive framework
- **Bootstrap Icons** - Icon library
- **Chart.js** - Data visualization
- **Fetch API** - Backend communication

### Backend

- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **TensorFlow/Keras** - Deep learning framework
- **PIL/Pillow** - Image processing
- **NumPy** - Numerical computations

### AI/ML Components

- **ResNet50** - Deep learning model (Transfer Learning)
- **Tumor Classification** - 4 classes: Glioma, Meningioma, Pituitary, No Tumor
- **Image Processing** - 224x224 pixel input normalization
- **Real-time Inference** - Live predictions via API

### Model Performance

- **Accuracy**: 40%
- **Precision**: 45%
- **Recall**: 38%
- **F1-Score**: 41%

## 📁 Project Structure

```
neuro-diagnosis/
├── Frontend/
│   ├── index.html                 # Landing page
│   ├── patient-login.html         # Patient login
│   ├── patient-dashboard.html     # Patient dashboard
│   ├── patient-upload.html        # MRI upload interface (✅ Backend integrated)
│   ├── patient-results-new.html   # Analysis results (✅ Backend integrated)
│   ├── doctor-login.html          # Doctor login
│   ├── doctor-dashboard.html      # Doctor dashboard
│   ├── doctor-review.html         # Detailed scan review (✅ Backend integrated)
│   ├── css/
│   │   ├── style.css             # Main styles
│   │   └── custom-style.css      # Custom medical theme
│   ├── js/
│   │   ├── main.js               # Core application logic
│   │   ├── mock-data.js          # Mock patient/scan data
│   │   ├── navigation.js         # Navigation & session management
│   │   └── ui-feedback.js        # Loading states & alerts
│   └── images/
│       ├── sample_mri_*.jpg      # Sample MRI scans
│       └── heatmap_*.jpg         # Grad-CAM heatmaps
│
├── Backend/ (Flask API)
│   ├── app.py                     # Flask server with API endpoints
│   ├── model/
│   │   └── resnet50_model.h5     # Trained ResNet50 model
│   └── requirements.txt           # Python dependencies
│
└── README.md
```

## ⚠️ Important Notes

### Current Implementation Status

- ✅ **Backend Integrated**: Flask API with real ResNet50 predictions
- ✅ **Real AI Processing**: Live tumor classification (4 classes)
- ✅ **API Endpoints**: POST /api/predict, GET /api/health
- ⚠️ **No Database**: Session storage used for temporary data
- ⚠️ **No Real Authentication**: Login is simulated for demo purposes
- ⚠️ **Local Only**: Backend runs on localhost:5000

### API Endpoints

**POST** `/api/predict`

- Accepts: MRI image file (JPG/PNG)
- Returns: Tumor classification + confidence + probabilities
- Response format:
  ```json
  {
    "success": true,
    "predicted_class": "glioma",
    "confidence_percentage": 92.41,
    "all_probabilities": {
      "glioma": 92.41,
      "meningioma": 5.23,
      "pituitary": 1.89,
      "notumor": 0.47
    }
  }
  ```

**GET** `/api/health`

- Returns: Server health status

### For Production Deployment

To make this production-ready, you would need:

1. ✅ ~~Backend server~~ (Already implemented with Flask)
2. ✅ ~~Actual ResNet50 model deployment~~ (Already implemented)
3. Database (PostgreSQL, MongoDB, etc.)
4. Real authentication system (JWT, OAuth)
5. Secure file storage (AWS S3, Azure Blob)
6. HIPAA compliance for medical data
7. SSL/TLS encryption
8. Cloud deployment (AWS, Azure, GCP)

## 🔮 Future Enhancements

### Technical Improvements

- [ ] Backend API integration
- [ ] Real-time model inference
- [ ] User authentication with JWT
- [ ] Database integration
- [ ] File upload to cloud storage
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Multi-language support

### Feature Additions

- [ ] Multiple scan types (CT, X-Ray)
- [ ] Tumor classification (glioma, meningioma, etc.)
- [ ] 3D visualization of brain scans
- [ ] Comparison with previous scans
- [ ] Doctor-patient messaging
- [ ] Appointment scheduling
- [ ] Medical history tracking
- [ ] Second opinion requests

### Model Improvements

- [ ] Improve model accuracy (target: >90%)
- [ ] Ensemble models
- [ ] Uncertainty quantification
- [ ] Multi-view analysis
- [ ] Tumor segmentation
- [ ] Size estimation

## 📊 Model Information

### ResNet50 Transfer Learning

- Pre-trained on ImageNet
- Fine-tuned on brain MRI dataset
- Input size: 224x224 pixels
- **Multi-class classification**: 4 classes
  - Glioma Tumor
  - Meningioma Tumor
  - Pituitary Tumor
  - No Tumor

### Real-time Inference

- Backend processes images in real-time
- Returns predictions with confidence scores
- Provides probability distribution across all classes
- Average inference time: ~2-3 seconds

## 🎓 Educational Use

This project is designed for:

- Final Year Project (FYP) presentations
- Machine Learning demonstrations
- Medical AI research
- Web development portfolio
- Educational purposes

**Disclaimer**: This system is for educational and demonstration purposes only. It is NOT intended for actual medical diagnosis or treatment. Always consult qualified medical professionals for health concerns.

## 👥 Credits

**Project**: Neuro Diagnosis - Brain Tumor Detection System  
**Type**: Final Year Project (FYP)  
**Year**: 2025  
**Technologies**: ResNet50, Grad-CAM, Bootstrap 5

## 📝 License

This project is for educational purposes. Not for commercial use.

---

**Neuro Diagnosis v1.0** | Powered by ResNet50 Transfer Learning & Grad-CAM Explainability
