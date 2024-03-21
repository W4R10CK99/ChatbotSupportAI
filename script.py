import pandas as pd

# Read Excel file
excel_file_path = 'dataset.xlsx'
excel_data = pd.ExcelFile(excel_file_path)

# Convert each sheet to JSON
for sheet_name in excel_data.sheet_names:
    df = excel_data.parse(sheet_name)
    
    # Create a separate JSON file for each sheet
    json_file_path = f'{sheet_name.lower().replace(" ", "_")}.json'
    df.to_json(json_file_path, orient='records')

print("Conversion to JSON completed.")