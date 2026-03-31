import torch
import pandas as pd
from model import AgroTwinModel, AgroDataset # Import your architecture

def run_demo_prediction():
    # 1. Set Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # 2. Load the Dataset (to get the LabelEncoders)
    ds = AgroDataset('business_ready_agri.csv')

    # 3. Initialize and Load the Model
    model = AgroTwinModel(
        n_fert=len(ds.le_fert.classes_), 
        n_soil=len(ds.le_soil.classes_), 
        n_crop=len(ds.le_crop.classes_)
    ).to(device)
    
    # LOAD FROM THE PATH
    model.load_state_dict(torch.load('agrotwin_model.pth', weights_only=True))
    model.eval()

    # 4. Mock Input (e.g., Rice in Clayey Soil)
    # In your real demo, these values come from your UI/Google Maps
    with torch.no_grad():
        # Example scaled numerical features
        mock_env = torch.randn(1, 8).to(device) 
        mock_fert = torch.tensor([0]).to(device)
        mock_soil = torch.tensor([0]).to(device)
        mock_crop = torch.tensor([0]).to(device)

        yield_out, risk_out = model(mock_env, mock_fert, mock_soil, mock_crop)
        
    print(f"✅ Prediction Successful!")
    print(f"Predicted Yield Score: {yield_out.item():.4f}")
    print(f"Predicted Risk Score: {risk_out.item():.4f}")

if __name__ == "__main__":
    run_demo_prediction()
