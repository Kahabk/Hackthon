import functions_framework
import torch
import os
import json
from model import AgroTwinModel # Ensure this matches your model.py class name

# Global variable to cache the model
model = None

def load_model():
    global model
    if model is None:
        try:
            # UPDATED TO MATCH YOUR SAVED WEIGHTS:
            model = AgroTwinModel(n_fert=8, n_soil=6, n_crop=33)
            
            model_path = os.path.join(os.path.dirname(__file__), 'agrotwin_model.pth')
            device = torch.device("cpu")
            model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
            model.eval()
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e
    return model

@functions_framework.http
def predict_agro(request):
    if request.method == 'OPTIONS':
        return ('', 204, {'Access-Control-Allow-Origin': '*'})

    data = request.get_json(silent=True)
    if not data or 'n' not in data:
        return (json.dumps({"status": "Live", "message": "Send N,P,K data"}), 200)

    try:
        net = load_model()
        # 1. Prepare your 8 numerical features (Match your training order!)
        # Example order: [N, P, K, Temp, Humidity, pH, Rainfall, Moisture]
        feats = [data['n'], data['p'], data['k'], data['temp'], 80, data['ph'], data['rain'], data['moist']]
        input_tensor = torch.tensor([feats], dtype=torch.float32)
        
        # 2. Prepare Categorical Indices
        f_idx = torch.tensor([data['fert']])
        s_idx = torch.tensor([data['soil']])
        c_idx = torch.tensor([data['crop']])

        # 3. Predict
        with torch.no_grad():
            yield_out, risk_out = net(input_tensor, f_idx, s_idx, c_idx)

        response = {
            "yield": round(float(yield_out.item()), 4),
            "risk": round(float(risk_out.item()), 4),
            "engine": "RTX-Trained Cloud Model"
        }
        return (json.dumps(response), 200, {'Access-Control-Allow-Origin': '*'})
    except Exception as e:
        return (json.dumps({"error": str(e)}), 500)