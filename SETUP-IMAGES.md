# Neuro Diagnosis - Image Setup Guide

## 🖼️ Setting Up Real Model Outputs

To make your **Neuro Diagnosis** demo use REAL outputs from your actual trained ResNet50 model instead of placeholder images, follow these steps:

## 📋 Step-by-Step Instructions

### Step 1: Prepare Your MRI Test Dataset

1. Select **3-4 high-quality MRI brain scans** from your test dataset
2. Choose a mix of cases:
   - ✅ At least **1 tumor-positive case** (clear tumor visible)
   - ✅ At least **1 tumor-negative case** (healthy brain)
   - ✅ Optional: 1-2 additional cases for variety

### Step 2: Generate Grad-CAM Heatmaps

Using your trained ResNet50 model, generate Grad-CAM visualizations:

```python
# Example Python code to generate Grad-CAM
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Load your trained model
model = load_model('your_resnet50_model.h5')

# Load and preprocess MRI image
img_path = 'path/to/mri_scan.jpg'
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0  # Normalize

# Generate Grad-CAM heatmap
# (Use your Grad-CAM implementation here)
heatmap = generate_gradcam(model, img_array, last_conv_layer_name='conv5_block3_out')

# Overlay heatmap on original image
superimposed_img = overlay_heatmap(img, heatmap)

# Save the result
cv2.imwrite('heatmap_output.jpg', superimposed_img)
```

### Step 3: Save Images to /images Folder

Save your generated images with the following naming convention:

```
/images/
├── sample_mri_1.jpg          ← Your actual MRI scan (tumor positive)
├── heatmap_1.jpg             ← Corresponding Grad-CAM heatmap
├── sample_mri_2.jpg          ← Your actual MRI scan (tumor negative)
├── heatmap_2.jpg             ← Corresponding Grad-CAM heatmap
├── sample_mri_3.jpg          ← Additional MRI scan
├── heatmap_3.jpg             ← Corresponding Grad-CAM heatmap
└── heatmap-sample.jpg        ← Default heatmap (keep this)
```

### Step 4: Image Specifications

Ensure your images meet these requirements:

- **Format**: JPG or PNG
- **Dimensions**: 224x224 pixels (or higher, will be scaled)
- **File Size**: Under 2MB per image
- **Quality**: High resolution, clearly visible
- **Color**: Grayscale MRI scans are fine
- **Heatmap**: Should show red/orange/yellow activation areas

### Step 5: Descriptive Naming (Optional)

For better organization, you can use more descriptive names:

```
neuro_diagnosis_tumor_positive_1.jpg
neuro_diagnosis_gradcam_tumor_positive_1.jpg
neuro_diagnosis_healthy_1.jpg
neuro_diagnosis_gradcam_healthy_1.jpg
```

Then update the references in `js/mock-data.js`:

```javascript
{
    patientId: "PT-2025-456",
    patientName: "Ahmad Khan",
    result: "Tumor Detected",
    scanImage: "images/neuro_diagnosis_tumor_positive_1.jpg",
    heatmapImage: "images/neuro_diagnosis_gradcam_tumor_positive_1.jpg"
}
```

## 🎯 Best Practices for Demo

### For Tumor-Positive Cases:

- ✅ Choose scans where tumor is clearly visible
- ✅ Grad-CAM should show strong activation (red/orange) in tumor region
- ✅ Helps demonstrate model is focusing on correct areas

### For Tumor-Negative Cases:

- ✅ Choose healthy brain scans
- ✅ Grad-CAM should show minimal or diffuse activation
- ✅ Demonstrates model correctly identifies healthy tissue

### Image Quality Tips:

- 📸 Use high-contrast images
- 📸 Ensure good lighting/visibility
- 📸 Crop to focus on brain region
- 📸 Remove any patient identifiers (HIPAA compliance)

## 🏷️ Adding Watermarks (Optional)

If presenting publicly, add "Neuro Diagnosis System" watermark:

```python
from PIL import Image, ImageDraw, ImageFont

def add_watermark(image_path, output_path):
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # Add watermark text
    text = "Neuro Diagnosis System"
    font = ImageFont.truetype("arial.ttf", 20)

    # Position at bottom right
    width, height = img.size
    textwidth, textheight = draw.textsize(text, font)
    x = width - textwidth - 10
    y = height - textheight - 10

    # Draw with semi-transparent background
    draw.rectangle([(x-5, y-5), (x+textwidth+5, y+textheight+5)], fill=(0,0,0,128))
    draw.text((x, y), text, font=font, fill=(255,255,255,200))

    img.save(output_path)
```

## 📊 Updating Mock Data

After adding your images, update `js/mock-data.js`:

```javascript
const mockPatients = [
  {
    patientId: "PT-2025-456",
    patientName: "Ahmad Khan",
    age: 45,
    scanDate: "2025-11-20",
    result: "Tumor Detected", // ← Match your actual result
    confidence: 87.5, // ← Use your model's confidence
    scanImage: "images/sample_mri_1.jpg",
    heatmapImage: "images/heatmap_1.jpg",
  },
  // ... more patients
];
```

## 🎓 For FYP Presentation

### What to Say:

- ✅ "These are REAL outputs from our trained ResNet50 model"
- ✅ "The Grad-CAM heatmaps show which brain regions influenced the AI's decision"
- ✅ "Red areas indicate high activation - where the model detected abnormalities"
- ✅ "This demonstrates explainable AI in medical diagnosis"

### What to Avoid:

- ❌ Don't claim 100% accuracy
- ❌ Don't say it's ready for clinical use
- ❌ Don't use patient data without consent

## 🔒 Privacy & Ethics

**IMPORTANT**:

- Remove all patient identifiers (names, IDs, dates)
- Get proper consent if using real patient data
- Comply with HIPAA/medical data regulations
- Use anonymized or synthetic data when possible

## ✅ Verification Checklist

Before your demo:

- [ ] All images are in /images folder
- [ ] File names match the code references
- [ ] Images are high quality and visible
- [ ] At least one tumor-positive case
- [ ] At least one tumor-negative case
- [ ] Grad-CAM heatmaps are properly generated
- [ ] No patient identifiers visible
- [ ] Watermarks added (if presenting publicly)
- [ ] Mock data updated with correct results
- [ ] Tested in browser - images load correctly

## 🆘 Troubleshooting

**Images not showing?**

- Check file paths are correct
- Ensure images are in /images folder
- Verify file names match exactly (case-sensitive)
- Check browser console for errors

**Heatmaps look wrong?**

- Verify Grad-CAM implementation
- Check color mapping (red = high activation)
- Ensure proper overlay on original image

**File size too large?**

- Compress images (use tools like TinyPNG)
- Resize to 224x224 or 512x512 max
- Convert to JPG with 80-90% quality

---

**Neuro Diagnosis** | Making AI Explainable in Medical Imaging
