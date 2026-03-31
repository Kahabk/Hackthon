import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder, StandardScaler

# --- 1. ENCODING CATEGORIES ---
class AgroDataset(Dataset):
    def __init__(self, csv_path):
        df = pd.read_csv(csv_path)
        
        # Check if labels exist to prevent the KeyError again
        if 'Yield_Score' not in df.columns:
            raise ValueError("Run the labeler script first to create Yield_Score and Risk_Score!")

        # Categorical Encoders
        self.le_crop = LabelEncoder()
        self.le_soil = LabelEncoder()
        self.le_fert = LabelEncoder()
        
        # Features
        cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'Moisture']
        self.num_features = df[cols].values
        self.scaler = StandardScaler()
        self.num_features = self.scaler.fit_transform(self.num_features)
        
        self.crop_idx = self.le_crop.fit_transform(df['target_crop'])
        self.soil_idx = self.le_soil.fit_transform(df['Soil Type'])
        self.fert_idx = self.le_fert.fit_transform(df['Fertilizer Name'])
        
        # Targets
        self.y_yield = torch.tensor(df['Yield_Score'].values, dtype=torch.float32)
        self.y_risk  = torch.tensor(df['Risk_Score'].values, dtype=torch.float32)
    def __len__(self): return len(self.num_features)
    
    def __getitem__(self, idx):
        return {
            'env': torch.tensor(self.num_features[idx], dtype=torch.float32),
            'fert': torch.tensor(self.fert_idx[idx], dtype=torch.long),
            'soil_type': torch.tensor(self.soil_idx[idx], dtype=torch.long),
            'crop': torch.tensor(self.crop_idx[idx], dtype=torch.long),
            'target_yield': self.y_yield[idx],
            'target_risk': self.y_risk[idx]
        }

# --- 2. MODIFIED ARCHITECTURE ---
class InteractionFusion(nn.Module):
    def __init__(self, dim=128):
        super().__init__()
        self.attn = nn.MultiheadAttention(dim, num_heads=4, batch_first=True)
        self.norm = nn.LayerNorm(dim)

    def forward(self, env_emb, fert_emb):
        # Cross-Attention: How environment affects fertilizer performance
        q, k, v = fert_emb.unsqueeze(1), env_emb.unsqueeze(1), env_emb.unsqueeze(1)
        attn_out, _ = self.attn(q, k, v)
        return self.norm(fert_emb + attn_out.squeeze(1))

class AgroTwinModel(nn.Module):
    def __init__(self, n_fert, n_soil, n_crop):
        super().__init__()
        self.env_enc = nn.Linear(8, 128)
        self.fert_emb = nn.Embedding(n_fert, 128)
        self.soil_emb = nn.Embedding(n_soil, 64)
        self.crop_emb = nn.Embedding(n_crop, 64)
        
        self.fusion = InteractionFusion(dim=128)
        
        # Output layers (from your MicroDrugNet head logic)
        self.fc = nn.Sequential(nn.Linear(128 + 64 + 64, 64), nn.ReLU())
        self.head_yield = nn.Linear(64, 1)
        self.head_risk  = nn.Linear(64, 1)

    def forward(self, env, fert, soil, crop):
        e = torch.relu(self.env_enc(env))
        f = self.fert_emb(fert)
        s = self.soil_emb(soil)
        c = self.crop_emb(crop)
        
        fused_fert = self.fusion(e, f)
        combined = torch.cat([fused_fert, s, c], dim=-1)
        hidden = self.fc(combined)
        
        return torch.sigmoid(self.head_yield(hidden)), torch.sigmoid(self.head_risk(hidden))

# --- 3. TRAINING EXECUTION ---
def start_training():
    dataset = AgroDataset('business_ready_agri.csv')
    loader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    model = AgroTwinModel(
        n_fert=len(dataset.le_fert.classes_), 
        n_soil=len(dataset.le_soil.classes_), 
        n_crop=len(dataset.le_crop.classes_)
    )
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.MSELoss()
    
    print("🚀 Training Started...")
    for epoch in range(10):
        for b in loader:
            optimizer.zero_grad()
            y_pred, r_pred = model(b['env'], b['fert'], b['soil_type'], b['crop'])
            loss = criterion(y_pred.squeeze(), b['target_yield']) + criterion(r_pred.squeeze(), b['target_risk'])
            loss.backward()
            optimizer.step()
        print(f"Epoch {epoch+1} | Loss: {loss.item():.4f}")
    
    torch.save(model.state_dict(), 'agrotwin_model.pth')
    print("✅ Model Saved!")

if __name__ == "__main__":
    start_training()