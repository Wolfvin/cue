"""
Pure logic extraction from kk.py — deterministic functions for Regrets fingerprinting.

Same principle as nik_logic.py: all data comes from parameters, no side effects,
no global state, no datetime.now().
"""

from typing import Union, Optional
from datetime import date


def parse_reg_code(reg_code: str, reference_year: int) -> Optional[dict]:
    """
    Pure function: Parse the 6-digit registration code from KK into date components.

    Similar to NIK birth code parsing, but for KK registration dates.
    Note: KK does NOT use the +40 female convention.

    Parameters:
        reg_code: 6-digit string from KK positions [6:12] (DDMMYY)
        reference_year: The current year (passed in, not datetime.now())

    Returns:
        dict with keys: day, month, year, formatted
        None if reg_code is invalid
    """
    if len(reg_code) != 6:
        return None

    day_code = int(reg_code[:2])
    if day_code < 1 or day_code > 31:
        return None

    month = int(reg_code[2:4])
    if month < 1 or month > 12:
        return None

    year_short = int(reg_code[4:6])

    # Resolve century
    year = 2000 + year_short
    if year > reference_year:
        year = 1900 + year_short

    # Validate the date
    try:
        dt = date(year, month, day_code)
    except ValueError:
        return None

    month_names = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    formatted = f"{day_code:02d} {month_names[month]} {year}"

    return {
        'day': day_code,
        'month': month,
        'year': year,
        'formatted': formatted,
    }


def validate_kk_length(idnum: Union[str, int]) -> str:
    """
    Pure function: Validate that KK is exactly 16 digits.

    Parameters:
        idnum: KK as string or integer

    Returns:
        KK as 16-digit string

    Raises:
        ValueError if KK is not 16 digits
    """
    idnum = str(idnum)
    if len(idnum) == 16:
        return idnum
    elif len(idnum) < 16:
        raise ValueError(
            f'Identification number (KK) is too short ({len(idnum)} characters), length should be 16'
        )
    else:
        raise ValueError(
            f'Identification number (KK) is too long ({len(idnum)} characters), length should be 16'
        )


def extract_nth_pub(idnum: str) -> int:
    """
    Pure function: Extract the registration sequence number from KK positions [13:16].

    Parameters:
        idnum: 16-digit string (already validated for length)

    Returns:
        Registration sequence number as integer
    """
    return int(idnum[13:])
