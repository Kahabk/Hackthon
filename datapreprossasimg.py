import pandas as pd
import glob
import os
import numpy as np

paths = {
    "crop": "/home/user/.cache/kagglehub/datasets/atharvaingle/crop-recommendation-dataset/versions/1",
    "fert": "/home/user/.cache/kagglehub/datasets/gdabhishek/fertilizer-prediction/versions/1",
    "soil": "/home/user/.cache/kagglehub/datasets/nikithkb/soilhealth/versions/1"
}

def load_data(name, path):
    files = glob.glob(os.path.join(path, "*.csv"))
    if not files: return None
    try:
        df = pd.read_csv(files[0], encoding='utf-8', low_memory=False)
    except:
        df = pd.read_csv(files[0], encoding='latin1', low_memory=False)
    print(f"📦 Loaded {name}: {df.shape}")
    return df

import pandas as pd
import numpy as np

# --- 1. LOAD DATA ---
# (Assume your load_data function and paths are already defined above)
df_crop = load_data("Crop", paths["crop"])
df_fert = load_data("Fertilizer", paths["fert"])
df_soil = load_data("Soil", paths["soil"])

# --- 2. THE ULTIMATE FEATURE LIST ---
# We ONLY keep these. If they don't exist, we skip them.
# These are the only things that matter for a Mobile App pitch.
target_features = [
    'N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall', 
    'label', 'Crop Type', 'Fertilizer Name', 'Soil Type', 'Moisture'
]

# --- 3. ALIGN & CLEAN EACH DATASET BEFORE MERGING ---
rename_map = {
    'Nitrogen': 'N', 'Phosphorous': 'P', 'Potassium': 'K',
    'Phosphorus': 'P', 'pH': 'ph', 'ph': 'ph',
    'label': 'target_crop', 'Crop Type': 'target_crop', 'Crop': 'target_crop'
}

processed_dfs = []
for name, df in [("Crop", df_crop), ("Fert", df_fert), ("Soil", df_soil)]:
    # Rename columns to standard N, P, K, ph
    df.rename(columns=rename_map, inplace=True)
    
    # Keep ONLY the columns from our target_features list
    valid_cols = [c for c in df.columns if c in target_features or c == 'target_crop']
    df_filtered = df[valid_cols].copy()
    
    print(f"✅ Filtered {name}: Kept {len(valid_cols)} relevant features.")
    processed_dfs.append(df_filtered)

# --- 4. THE SMART FUSION ---
# Stack them up
final_df = pd.concat(processed_dfs, axis=0, ignore_index=True)

# SMART IMPUTATION: Fill missing N, P, K based on the CROP they belong to
# This turns the academic Soil data into usable "Crop Profiles"
if 'target_crop' in final_df.columns:
    for col in ['N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall']:
        if col in final_df.columns:
            # Fill missing values with the median for that specific crop
            final_df[col] = final_df[col].fillna(final_df.groupby('target_crop')[col].transform('median'))

# --- 5. FINAL POLISH ---
# Drop rows that have no target_crop (we can't predict "Unknown")
final_df = final_df[final_df['target_crop'] != "Unknown"]
final_df.dropna(subset=['target_crop'], inplace=True)

# Global median for any remaining gaps
final_df.fillna(final_df.median(numeric_only=True), inplace=True)

# Save
final_df.to_csv("business_ready_agri.csv", index=False)

print("\n🎯 --- BUSINESS-READY DATASET ---")
print(f"Total Rows: {final_df.shape[0]}")
print(f"Final Clean Columns: {list(final_df.columns)}")
print(f"Sample Targets: {final_df['target_crop'].unique()[:5]}")