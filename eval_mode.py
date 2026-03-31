import torch
import pandas as pd
from model import AgroDataset, AgroTwinModel
from torch.utils.data import DataLoader, random_split

def evaluate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 1. Load Data and Split (80% Train, 20% Test)
    full_dataset = AgroDataset('business_ready_agri.csv')
    train_size = int(0.8 * len(full_dataset))
    test_size = len(full_dataset) - train_size
    _, test_ds = random_split(full_dataset, [train_size, test_size])
    loader = DataLoader(test_ds, batch_size=1, shuffle=False)

    # 2. Load Saved Model
    model = AgroTwinModel(
        n_fert=len(full_dataset.le_fert.classes_), 
        n_soil=len(full_dataset.le_soil.classes_), 
        n_crop=len(full_dataset.le_crop.classes_)
    ).to(device)
    model.load_state_dict(torch.load('agrotwin_model.pth'))
    model.eval()

    print(f"\n🔍 Evaluating on {len(test_ds)} unseen samples...")
    
    total_error = 0
    with torch.no_grad():
        for i, b in enumerate(loader):
            y_pred, r_pred = model(b['env'].to(device), b['fert'].to(device), b['soil_type'].to(device), b['crop'].to(device))
            
            # Compare first 5 results visually
            if i < 5:
                crop_name = full_dataset.le_crop.inverse_transform([b['crop'].item()])[0]
                fert_name = full_dataset.le_fert.inverse_transform([b['fert'].item()])[0]
                print(f"--- Sample {i+1} ---")
                print(f"Crop: {crop_name} | Fert: {fert_name}")
                print(f"PREDICTED Yield: {y_pred.item():.2%}")
                print(f"ACTUAL Yield: {b['target_yield'].item():.2%}\n")

if __name__ == "__main__":
    evaluate()