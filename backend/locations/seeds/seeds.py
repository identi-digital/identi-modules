"""
Seeds data for locations module.
This module contains initial data that will be inserted during migrations.

Structure:
SEEDS = {
    "table_name": [
        {row_data},
        {row_data}
    ]
}
"""
import json
import os
from typing import Dict, List, Any
from pathlib import Path

# Get the directory where this file is located
_CURRENT_DIR = Path(__file__).parent


def _load_json_file(filename: str) -> List[Dict[str, Any]]:
    """Load and parse a JSON file from the seeds directory."""
    file_path = _CURRENT_DIR / filename
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


# Load all JSON data files
_countries_data = _load_json_file('countries.json')
_departments_data = _load_json_file('departments.json')
_provinces_data = _load_json_file('provinces.json')
_districts_data = _load_json_file('districts.json')


# Seeds structure: table_name -> list of rows to insert
# Data must be already transformed to match the model schema
SEEDS: Dict[str, List[Dict[str, Any]]] = {
    "countries": _countries_data,
    "departments": _departments_data,
    "provinces": _provinces_data,
    "districts": _districts_data,
}
