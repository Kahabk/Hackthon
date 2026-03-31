
# AgroTwin — AI-Powered Agricultural Digital Twin

## Problem Statement

Smallholder and commercial farmers worldwide struggle to make data-driven decisions about crop selection, fertilizer use, and yield forecasting. Traditional farming relies on guesswork and outdated practices, leading to wasted inputs, poor yields, and unnecessary environmental risk. There is no accessible, intelligent tool that combines real-time geospatial data, soil science, and AI to give farmers a complete picture of their land — before they plant a single seed.

## Project Description

AgroTwin is a full-stack agricultural intelligence platform that creates a **digital twin of any farm location on Earth**. A farmer simply selects their location on an interactive satellite map, inputs their soil data (N, P, K, pH, moisture), picks their crop and fertilizer, and AgroTwin does the rest.

Under the hood, a custom **PyTorch deep learning model** (trained on real agricultural datasets with multi-head cross-attention) predicts **Yield Score** and **Risk Score** from the cloud. Gemini AI then takes those predictions and generates a full expert-level report — including land use classification, soil-fertilizer interaction analysis, seasonal suitability, and actionable recommendations. Finally, Gemini's image generation model renders a **realistic satellite view** of the farm based on the AI analysis.

### Key Features

- Location-based farm analysis  
- AI yield & risk prediction  
- Structured agronomy reports (Gemini)  
- AI-generated satellite visualization  
- Cloud-based real-time inference  

### How It Works

1. User selects farm location on map  
2. Inputs soil data (N, P, K, pH, moisture)  
3. ML model predicts yield & risk  
4. Gemini generates report + recommendations  
5. AI generates satellite-style visualization  

The result: a farmer anywhere in the world gets a professional agronomist-level report in seconds.

---

## Google AI Usage

### Tools / Models Used

- **Google AI Studio** — Used to bootstrap and deploy the frontend application
- **Gemini (`gemini-3-flash-preview`)** — Generates structured JSON agricultural intelligence reports
- **Gemini (`gemini-2.5-flash-image`)** — Generates AI satellite imagery of the selected farm
- **`@google/genai` SDK (v1.29.0)** — TypeScript SDK used to call both Gemini text and image models
- **`@vis.gl/react-google-maps`** — Google Maps integration for geospatial farm visualization
- **Google Cloud Run** — Hosts and serves the trained PyTorch prediction model as a live REST API (`https://agrotwin-api-vesn3gmkga-uc.a.run.app`)
- **Google Cloud Functions (`functions_framework`)** — Serverless deployment of the ML inference endpoint in `agro_deploy/main.py`

### How Google AI Was Used

AgroTwin uses Google AI at **three distinct stages** of the prediction pipeline:

1. **Prediction via Cloud Run** — When the user hits "Analyze Farm", the frontend sends soil + weather data to the AgroTwin ML model hosted on Google Cloud Run. The model (a custom PyTorch transformer with cross-attention between environmental and fertilizer embeddings) returns a `yield` score and `risk` score in real time.

2. **Gemini Report Generation** — The raw prediction scores are passed to `gemini-3-flash-preview` via the `@google/genai` SDK. Gemini acts as an expert agronomist — it receives the full context (location, soil NPK, weather, satellite indicators, crop, fertilizer) and returns a **structured JSON report** enforced by a strict response schema. The report includes:
   - Land use classification (Agriculture %, Forest %, Water %, Urban %, Bare Soil %)
   - Soil and fertilizer nutrient analysis with effectiveness and loss estimates
   - Yield, Risk, and Nutrient Efficiency predictions
   - Seasonal suitability with best planting months and reasoning
   - Detailed explanation of land impact, soil-fertilizer interaction, and weather effects
   - Actionable farming recommendations
   - the ai model was deployid on google cloud the logs ## proof
   - ![Project Screenshot](./Screenshot%20from%202026-03-31%2014-46-59.png)
3. **Gemini Satellite Image Generation** — After the report is ready, `gemini-2.5-flash-image` generates a photorealistic satellite-style aerial view of the farm, customized with the actual land classification percentages and crop type returned by the AI report.

---

## Proof of Google AI Usage

Add your proof screenshots to a `/proof` folder:

![AI Proof 1](./proof/screenshot1.png)
![AI Proof 2](./proof/screenshot2.png)

---

## Screenshots

![Screenshot 1](./Screenshot%20from%202026-03-31%2016-11-50.png)
![Screenshot 2](./Screenshot%20from%202026-03-31%2016-12-17.png)

---

## Demo Video

Upload your demo video to Google Drive and paste the shareable link here (max 3 minutes).



[LINK TO PROJECT DEMO__of_the_app_vedio](https://drive.google.com/drive/folders/1IKZSgD1J8qTeyZX5AyX2LQreFpBDC0Rv?usp=sharing)

---

## Installation Steps

```bash
# Clone the repository
git clone https://github.com/Kahabk/Hackthon

# Go to the project folder
cd Hackthon

# Install Node.js dependencies
npm install

# Set your Gemini API key
# Create a .env.local file and add:
# GEMINI_API_KEY=your_gemini_api_key_here

# Run the development server (frontend + backend)
npm run dev
```

The app runs at `http://localhost:3000`

### Python ML Backend (Optional — Local Training)

```bash
# Install Python dependencies
pip install torch pandas numpy scikit-learn

# Label the raw data
python label_data.py

# Train the AgroTwin model
python model.py

# Run a demo prediction
python demo.py

# Evaluate model accuracy
python eval_mode.py
```

> **Note:** The cloud prediction endpoint (`https://agrotwin-api-vesn3gmkga-uc.a.run.app`) is already live via Google Cloud Run — you do not need to run the Python backend locally to use the app.
