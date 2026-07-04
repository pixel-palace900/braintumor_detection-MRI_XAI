import sys
import base64
import uuid
if sys.stdout is not None:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr is not None:
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
from werkzeug.utils import secure_filename
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

CLASS_NAMES = [
    'glioma_tumor',
    'invalid',
    'meningioma_tumor',
    'no_tumor',
    'pituitary_tumor'
]

NUM_CLASSES = 5

MODEL_METRICS = {
    'accuracy': 85.0,
    'precision': 88.0,
    'recall': 88.0,
    'f1_score': 84.0
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "MV2final_model.h5")

print("Loading trained model...")
print(f"Looking for model at: {MODEL_PATH}")


def build_model():
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    x = base.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dense(128, activation='relu')(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    x = tf.keras.layers.Dense(NUM_CLASSES, activation='softmax')(x)
    return tf.keras.Model(inputs=base.input, outputs=x)


try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

    print("Building model architecture...")
    model = build_model()
    print("Loading weights from file...")
    model.load_weights(MODEL_PATH)
    print("[SUCCESS] Model loaded successfully!")

except Exception as e:
    import traceback
    print(f"[ERROR] Error loading model: {e}")
    traceback.print_exc()
    model = None


def allowed_file(filename):
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image. File may be corrupted or unsupported.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32")
    img_expanded = np.expand_dims(img, axis=0)
    img_preprocessed = preprocess_input(img_expanded)
    return img_preprocessed


def generate_gradcam(image_path, predicted_class_idx):
    try:
        # Find the last conv layer in MobileNetV2
        last_conv_layer_name = 'out_relu'
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[
                model.get_layer(last_conv_layer_name).output,
                model.output
            ]
        )

        img = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
        img_array = preprocess_input(
            np.expand_dims(img_resized.astype("float32"), axis=0)
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, predicted_class_idx]

        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()

        # Resize heatmap to original image size
        heatmap_resized = cv2.resize(heatmap, (img_resized.shape[1], img_resized.shape[0]))
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

        # Overlay heatmap on original image
        superimposed = cv2.addWeighted(img_resized, 0.6, heatmap_colored, 0.4, 0)

        # Encode to base64
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(superimposed, cv2.COLOR_RGB2BGR))
        gradcam_base64 = base64.b64encode(buffer).decode('utf-8')

        return f"data:image/jpeg;base64,{gradcam_base64}"

    except Exception as e:
        print(f"[ERROR] Grad-CAM failed: {e}")
        return None


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Brain Tumor Diagnosis API is running',
        'model_loaded': model is not None,
        'classes': CLASS_NAMES,
        'num_classes': NUM_CLASSES
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    filepath = None
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded. Check server logs.'}), 500

        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file format. Use PNG, JPG, or JPEG'
            }), 400

        # Generate a unique filename using UUID to prevent overwrite issues
        original_filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        filename = f"{unique_id}_{original_filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        print(f"\n[UPLOAD] Processing image: {filename}")

        img_preprocessed = preprocess_image(filepath)
        predictions = model.predict(img_preprocessed, verbose=0)

        predicted_class_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][predicted_class_idx])
        predicted_class = CLASS_NAMES[predicted_class_idx]

        all_probabilities = {
            CLASS_NAMES[i]: float(predictions[0][i])
            for i in range(NUM_CLASSES)
        }

        # Generate Grad-CAM heatmap
        gradcam_image = generate_gradcam(filepath, predicted_class_idx)

        if predicted_class == "invalid":
            return jsonify({
                'success': True,
                'predicted_class': 'invalid',
                'message': 'Please upload a valid brain MRI image.',
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 2),
                'all_probabilities': all_probabilities
            })

        response = {
            'success': True,
            'predicted_class': predicted_class,
            'predicted_class_id': predicted_class_idx,
            'confidence': confidence,
            'confidence_percentage': round(confidence * 100, 2),
            'all_probabilities': all_probabilities,
            'gradcam_image': gradcam_image,
            'timestamp': str(np.datetime64('now')),
            'model_metrics': MODEL_METRICS
        }

        print(f"[SUCCESS] Prediction: {predicted_class} ({confidence * 100:.2f}%)")
        return jsonify(response)

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

    finally:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)


@app.route('/login', methods=['POST'])
def login():
    try:
        # Support both JSON and Form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
            
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return jsonify({'success': False, 'error': 'Email and password are required'}), 400
            
        email_lower = email.lower()
        username = email.split('@')[0].lower()
        
        # Check for admin role
        is_admin = 'admin' in email_lower
        
        # Check for doctor/radiologist role
        is_doc_or_rad = (
            'doctor' in email_lower or
            'dr.' in email_lower or
            'radiologist' in email_lower or
            'rad' in email_lower or
            email_lower.endswith('.hospital.com') or
            email_lower.endswith('@neuro') or
            username.endswith('dr') or
            username.endswith('rad')
        )
        
        if is_admin:
            if password == 'Admin@12':
                # Parse admin name
                clean_name = username.replace('admin', '').replace('.', ' ').replace('-', ' ').replace('_', ' ').strip()
                name = ' '.join(word.capitalize() for word in clean_name.split())
                if name in ["Akiza", "Akizadr", "Alizadr"]:
                    name = "Aliza"
                if not name:
                    name = "System"
                display_name = f"{name} Admin"
                
                return jsonify({
                    'success': True,
                    'role': 'admin',
                    'redirect_url': 'admin-dashboard.html',
                    'user_data': {
                        'name': display_name,
                        'email': email,
                        'role': 'Administrator',
                        'id': 'ADM-001'
                    }
                })
            else:
                return jsonify({'success': False, 'error': 'Invalid admin password. Default is Admin@12'}), 401
                
        elif is_doc_or_rad:
            status = 'pending' if 'pending' in email_lower else 'active'
            redirect_url = 'doctor-pending.html' if status == 'pending' else 'doctor-dashboard.html'
            
            # Parse doctor/radiologist name
            clean_name = username
            for term in ['dr.', 'dr', 'doctor', 'radiologist', 'rad']:
                if clean_name.startswith(term):
                    clean_name = clean_name[len(term):]
                if clean_name.endswith(term):
                    clean_name = clean_name[:-len(term)]
                clean_name = clean_name.replace(f'.{term}', '').replace(f'{term}.', '').replace(term, '')
                
            clean_name = clean_name.replace('.', ' ').replace('-', ' ').replace('_', ' ').strip()
            name = ' '.join(word.capitalize() for word in clean_name.split())
            if name in ["Akiza", "Akizadr", "Alizadr"]:
                name = "Aliza"
            if not name:
                name = "Aliza" # default doctor name
                
            is_radiologist = 'radiologist' in email_lower or 'rad' in email_lower or username.endswith('rad')
            if is_radiologist:
                display_name = f"Dr. {name} (Radiologist)"
            else:
                display_name = f"Dr. {name}"
                
            return jsonify({
                'success': True,
                'role': 'doctor', # Use 'doctor' to pass dashboard access control
                'redirect_url': redirect_url,
                'user_data': {
                    'name': display_name,
                    'email': email,
                    'licenseNumber': 'LIC-98243',
                    'status': status,
                    'id': 'DR-8742'
                }
            })
            
        else:
            # Parse patient name
            clean_name = username.replace('.', ' ').replace('-', ' ').replace('_', ' ').strip()
            name = ' '.join(word.capitalize() for word in clean_name.split())
            if name in ["Akiza", "Akizadr", "Alizadr"]:
                name = "Aliza"
            if not name:
                name = "John Doe"
                
            return jsonify({
                'success': True,
                'role': 'patient',
                'redirect_url': 'patient-dashboard.html',
                'user_data': {
                    'name': name,
                    'email': email,
                    'id': 'PT-1982'
                }
            })
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'model_name': 'Brain Tumor Classification - MobileNetV2',
        'classes': CLASS_NAMES,
        'num_classes': NUM_CLASSES,
        'input_size': IMG_SIZE,
        'framework': 'TensorFlow/Keras',
        'model_metrics': MODEL_METRICS
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("[BRAIN] BRAIN TUMOR DIAGNOSIS - FLASK BACKEND")
    print("=" * 60)
    print(f"Classes: {', '.join(CLASS_NAMES)}")
    print(f"Model path: {MODEL_PATH}")
    print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
    print(f"Model loaded: {model is not None}")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)