import pandas as pd
import numpy as np

# Load your business-ready dataset
df = pd.read_csv('business_ready_agri.csv')

print("Generating synthetic labels for training...")

# 1. Yield Score Logic: (NPK + Moisture balanced against Ideal pH)
# High NPK is good, but if pH is too acidic (<5) or basic (>8), yield drops.
npk_sum = (df['N'] + df['P'] + df['K']) / 300
ph_factor = df['ph'].apply(lambda x: 1.0 if 6.0 <= x <= 7.5 else 0.7)
df['Yield_Score'] = (npk_sum * ph_factor * (df['Moisture'] / 100)).clip(0, 1)

# 2. Risk Score Logic: (High Rainfall + High Nitrogen = Runoff/Leaching Risk)
# Also high temperature + low moisture = Drought Risk
runoff_risk = (df['rainfall'] * df['N']) / (df['rainfall'].max() * df['N'].max())
drought_risk = (df['temperature'] > 35).astype(float) * (df['Moisture'] < 20).astype(float)
df['Risk_Score'] = (runoff_risk + drought_risk).clip(0, 1)

# Save back to the same file
df.to_csv('business_ready_agri.csv', index=False)
print("✅ Labels 'Yield_Score' and 'Risk_Score' added successfully!")