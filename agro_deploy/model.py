
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from torch.utils.data import Dataset, DataLoader



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