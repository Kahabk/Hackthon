import pandas as pd
df = pd.read_csv('business_ready_agri.csv')
# Fill missing fertilizers with the most common one or a placeholder
df['Fertilizer Name'] = df['Fertilizer Name'].fillna('Organic Manure')
df.to_csv('business_ready_agri.csv', index=False)
print("✅ Fertilizer NaNs fixed!")