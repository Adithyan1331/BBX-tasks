import numpy as np
import pandas as pd

data = {
    "Work": [
        "Excavation",
        "Concrete",
        "Brickwork",
        "Plastering"
    ],
    "Quantity": [100, 12, 50, 200],
    "Rate": [250, 7000, 6000, 250]
}

df = pd.DataFrame(data)

# Calculate estimated cost
df["Estimated_Cost"] = np.multiply(
    df["Quantity"],
    df["Rate"]
)

print(df)

print(
    "Total Estimated Cost: ₹",
    np.sum(df["Estimated_Cost"])
)