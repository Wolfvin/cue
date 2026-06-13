"""
Shared utilities for nomiden — region lookup, length validation.

This module extracts common code that was duplicated between nik.py and kk.py.
Both modules need the same region CSV lookup and length validation logic.
"""

import os
from typing import Union
import pandas as pd

# Load region code CSV once (shared across NIK and KK)
this_dir, this_filename = os.path.split(__file__)
DATA_PATH = os.path.join(this_dir, "data", "regcode.csv")
_region_cache = None


def _get_region_data() -> pd.DataFrame:
    """Lazily load and cache the region code CSV data."""
    global _region_cache
    if _region_cache is None:
        _region_cache = pd.read_csv(DATA_PATH)
    return _region_cache


def validate_id_length(idnum: Union[str, int], label: str = "Identification number") -> str:
    """
    Validate that an ID number is exactly 16 digits.

    Parameters:
        idnum: ID number as string or integer
        label: Label for error messages (e.g., "NIK" or "KK")

    Returns:
        ID number as 16-digit string

    Raises:
        ValueError if ID is not 16 digits
    """
    idnum = str(idnum)
    length = len(idnum)
    if length == 16:
        return idnum
    elif length < 16:
        raise ValueError(
            f'{label} is too short ({length} characters), length should be 16'
        )
    else:
        raise ValueError(
            f'{label} is too long ({length} characters), length should be 16'
        )


def lookup_province(idnum: str) -> str:
    """
    Look up province name from the first 2 digits of an ID number.

    Parameters:
        idnum: 16-digit ID string (already validated)

    Returns:
        Province name string, or NaN if not found
    """
    rc = _get_region_data()
    prov_code = int(idnum[:2])
    try:
        return rc.loc[rc['code'] == prov_code, 'region'].item()
    except (ValueError, IndexError):
        return float('nan')


def lookup_city(idnum: str) -> str:
    """
    Look up city name from the first 4 digits of an ID number.

    Parameters:
        idnum: 16-digit ID string (already validated)

    Returns:
        City name string, or NaN if not found
    """
    rc = _get_region_data()
    city_code = int(idnum[:4])
    try:
        return rc.loc[rc['code'] == city_code, 'region'].item()
    except (ValueError, IndexError):
        return float('nan')


def lookup_district(idnum: str) -> str:
    """
    Look up district name from the first 6 digits of an ID number.

    Parameters:
        idnum: 16-digit ID string (already validated)

    Returns:
        District name string, or NaN if not found
    """
    rc = _get_region_data()
    dist_code = int(idnum[:6])
    try:
        return rc.loc[rc['code'] == dist_code, 'region'].item()
    except (ValueError, IndexError):
        return float('nan')
