
from ucimlrepo import fetch_ucirepo

print("Downloading traffic dataset...")

dataset = fetch_ucirepo(id=608)

X = dataset.data.features
y = dataset.data.targets

print("\nDataset downloaded successfully!")
print("Feature shape:", X.shape)
print("Target shape:", y.shape)

print("\nFirst 5 feature rows:")
print(X.head())

print("\nFirst 5 target rows:")
print(y.head())

print("\nTarget column names:")
print(y.columns.tolist())
