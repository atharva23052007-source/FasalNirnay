import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Ensure folders exist
os.makedirs("data", exist_ok=True)
os.makedirs("model", exist_ok=True)

CSV_URL = "https://raw.githubusercontent.com/gabbygab1233/Crop-Recommender/main/Crop_recommendation.csv"
CSV_PATH = os.path.join("data", "Crop_recommendation.csv")

def download_dataset():
    print(f"Downloading crop recommendation dataset from: {CSV_URL}")
    try:
        # User-agent header to bypass standard urllib blockages
        req = urllib.request.Request(
            CSV_URL, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response, open(CSV_PATH, 'wb') as out_file:
            out_file.write(response.read())
        print("Dataset downloaded successfully.")
        return True
    except Exception as e:
        print(f"WARNING: Failed to download dataset: {e}")
        return False

def generate_synthetic_dataset():
    print("Generating a realistic synthetic dataset for fallback...")
    crops = [
        'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
        'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
        'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple',
        'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'
    ]
    
    np.random.seed(42)
    rows = []
    
    # Generate ~100 rows per crop to make a solid training set (2200 rows total)
    for crop in crops:
        for _ in range(100):
            # Generate values slightly tailored per crop to make it learnable
            if crop == 'rice':
                n, p, k = np.random.randint(60, 100), np.random.randint(35, 60), np.random.randint(35, 45)
                temp, hum, ph, rain = np.random.uniform(20, 30), np.random.uniform(80, 95), np.random.uniform(5.0, 7.0), np.random.uniform(150, 300)
            elif crop == 'maize':
                n, p, k = np.random.randint(50, 90), np.random.randint(35, 55), np.random.randint(15, 25)
                temp, hum, ph, rain = np.random.uniform(18, 35), np.random.uniform(55, 75), np.random.uniform(5.5, 7.0), np.random.uniform(60, 110)
            elif crop == 'chickpea':
                n, p, k = np.random.randint(20, 60), np.random.randint(55, 80), np.random.randint(75, 85)
                temp, hum, ph, rain = np.random.uniform(15, 22), np.random.uniform(15, 25), np.random.uniform(5.0, 9.0), np.random.uniform(60, 95)
            elif crop == 'pomegranate':
                n, p, k = np.random.randint(10, 40), np.random.randint(10, 30), np.random.randint(35, 45)
                temp, hum, ph, rain = np.random.uniform(18, 45), np.random.uniform(80, 95), np.random.uniform(5.5, 7.5), np.random.uniform(40, 110)
            elif crop == 'grapes':
                n, p, k = np.random.randint(20, 40), np.random.randint(120, 145), np.random.randint(195, 205)
                temp, hum, ph, rain = np.random.uniform(15, 42), np.random.uniform(80, 85), np.random.uniform(5.5, 6.5), np.random.uniform(60, 110)
            elif crop == 'coffee':
                n, p, k = np.random.randint(80, 120), np.random.randint(15, 35), np.random.randint(25, 35)
                temp, hum, ph, rain = np.random.uniform(20, 30), np.random.uniform(50, 65), np.random.uniform(6.0, 7.5), np.random.uniform(140, 190)
            else:
                # Default generic crop parameters
                n = np.random.randint(20, 120)
                p = np.random.randint(20, 100)
                k = np.random.randint(10, 80)
                temp = np.random.uniform(15, 40)
                hum = np.random.uniform(30, 90)
                ph = np.random.uniform(5.5, 8.0)
                rain = np.random.uniform(50, 250)
                
            rows.append([n, p, k, temp, hum, ph, rain, crop])
            
    df = pd.DataFrame(rows, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
    df.to_csv(CSV_PATH, index=False)
    print("Synthetic dataset saved successfully.")

def main():
    # 1. Download or generate dataset
    if not os.path.exists(CSV_PATH):
        success = download_dataset()
        if not success:
            generate_synthetic_dataset()
    else:
        print("Using existing local dataset.")

    # 2. Load dataset
    print(f"Loading dataset from: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    
    # 3. Preprocessing
    # Separate features and target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    # Encode crop labels to numeric values
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # 4. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
    
    # 5. Model Training (Random Forest)
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 6. Evaluation
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Model Training Accuracy: {train_acc * 100:.2f}%")
    print(f"Model Test Accuracy: {test_acc * 100:.2f}%")
    
    # 7. Save Model & Label Encoder
    model_path = os.path.join("model", "crop_recommendation_model.joblib")
    encoder_path = os.path.join("model", "label_encoder.joblib")
    
    print(f"Saving trained model to: {model_path}")
    joblib.dump(model, model_path)
    
    print(f"Saving label encoder to: {encoder_path}")
    joblib.dump(label_encoder, encoder_path)
    
    print("Model training and saving complete.")

if __name__ == "__main__":
    main()
