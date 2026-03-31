import kagglehub
import pandas as pd
import numpy as np
import os
from pathlib import Path

# Download datasets
print("=" * 80)
print("DOWNLOADING DATASETS")
print("=" * 80)

crop_path = kagglehub.dataset_download("atharvaingle/crop-recommendation-dataset")
print("✓ Crop Recommendation Dataset:", crop_path)

fertilizer_path = kagglehub.dataset_download("gdabhishek/fertilizer-prediction")
print("✓ Fertilizer Prediction Dataset:", fertilizer_path)

soilhealth_path = kagglehub.dataset_download("nikithkb/soilhealth")
print("✓ Soil Health Dataset:", soilhealth_path)

# Load datasets
print("\n" + "=" * 80)
print("LOADING DATASETS")
print("=" * 80)

crop_df = pd.read_csv(os.path.join(crop_path, "Crop_recommendation.csv"))
fertilizer_df = pd.read_csv(os.path.join(fertilizer_path, "Fertilizer Prediction.csv"))
soilhealth_df = pd.read_csv(os.path.join(soilhealth_path, "SoilHealthDB_V2.csv"))

print(f"\n✓ Crop Recommendation: {crop_df.shape[0]} rows × {crop_df.shape[1]} columns")
print(f"✓ Fertilizer Prediction: {fertilizer_df.shape[0]} rows × {fertilizer_df.shape[1]} columns")
print(f"✓ Soil Health: {soilhealth_df.shape[0]} rows × {soilhealth_df.shape[1]} columns")

# METADATA ANALYSIS
print("\n" + "=" * 80)
print("METADATA ANALYSIS")
print("=" * 80)

def analyze_dataset(df, name):
    print(f"\n{'─' * 40}")
    print(f"{name.upper()}")
    print(f"{'─' * 40}")
    print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    print(f"\nColumns: {list(df.columns)}")
    print(f"\nData Types:\n{df.dtypes}")
    print(f"\nMissing Values:\n{df.isnull().sum()[df.isnull().sum() > 0]}")
    print(f"\nBasic Statistics:\n{df.describe().T}")

analyze_dataset(crop_df, "crop recommendation")
analyze_dataset(fertilizer_df, "fertilizer prediction")

# Soil health has too many columns, show summary
print(f"\n{'─' * 40}")
print("SOIL HEALTH (SUMMARY)")
print(f"{'─' * 40}")
print(f"Shape: {soilhealth_df.shape[0]} rows × {soilhealth_df.shape[1]} columns")
print(f"Columns ({len(soilhealth_df.columns)}): {list(soilhealth_df.columns[:20])}...")
print(f"Missing Values (top 10):\n{soilhealth_df.isnull().sum().nlargest(10)}")

# MERGE DATASETS
print("\n" + "=" * 80)
print("MERGING DATASETS")
print("=" * 80)

# Subsetting soil health to relevant columns for merging
soil_subset_cols = ['SoilpH', 'Texture', 'SandPerc', 'SiltPerc', 'ClayPerc', 'Country', 'Latitude', 'Longitude']
available_soil_cols = [col for col in soil_subset_cols if col in soilhealth_df.columns]
soilhealth_subset = soilhealth_df[available_soil_cols].head(100)

print(f"\nSoil Health subset: {soilhealth_subset.shape[0]} rows × {soilhealth_subset.shape[1]} columns")

# Merge crop and fertilizer datasets (common crops/soil types)
print("\n✓ Merging Crop Recommendation + Fertilizer Prediction...")
# Both datasets have crop-related data, attempt merge on similar features
merged_cf = pd.concat([crop_df, fertilizer_df], axis=0, ignore_index=True)
print(f"  Combined shape: {merged_cf.shape[0]} rows × {merged_cf.shape[1]} columns")

# Create comprehensive analysis report
print("\n" + "=" * 80)
print("KEY INSIGHTS")
print("=" * 80)

print("\n1. CROP DATASET INSIGHTS:")
print(f"   - Unique crops: {crop_df['label'].nunique()}")
print(f"   - Crop types: {crop_df['label'].unique()}")
print(f"   - Avg NPK (N,P,K): {crop_df[['N','P','K']].mean().values}")

print("\n2. FERTILIZER DATASET INSIGHTS:")
print(f"   - Unique fertilizers: {fertilizer_df['Fertilizer Name'].nunique()}")
print(f"   - Unique crop types: {fertilizer_df['Crop Type'].nunique()}")
print(f"   - Soil types: {fertilizer_df['Soil Type'].unique()}")

print("\n3. SOIL HEALTH DATASET INSIGHTS:")
print(f"   - Countries: {soilhealth_df['Country'].nunique()}")
print(f"   - Avg pH: {soilhealth_df['SoilpH'].mean():.2f}")
print(f"   - Texture types: {soilhealth_df['Texture'].nunique()}")

# Save merged dataset
print("\n" + "=" * 80)
print("SAVING MERGED DATASET")
print("=" * 80)

output_dir = Path("/home/user/Hckthon_1")
merged_crop_fert = crop_df.merge(fertilizer_df, left_on='label', right_on='Crop Type', how='inner')
merged_crop_fert.to_csv(output_dir / "merged_crop_fertilizer.csv", index=False)
print(f"✓ Saved merged_crop_fertilizer.csv ({merged_crop_fert.shape[0]} rows)")

soilhealth_subset.to_csv(output_dir / "soil_health_summary.csv", index=False)
print(f"✓ Saved soil_health_summary.csv ({soilhealth_subset.shape[0]} rows)")

print("\n" + "=" * 80)
print("ANALYSIS COMPLETE!")
print("=" * 80)
