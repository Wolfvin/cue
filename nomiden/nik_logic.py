"""
Pure logic extraction from nik.py — deterministic functions for Regrets fingerprinting.

The original nik._check_birth() uses datetime.now() for century resolution,
making it non-deterministic. This module extracts the pure logic so it can
be fingerprinted reliably.

Pure Logic Rule: All data comes from parameters. No datetime.now(), no date.today(),
no global state.
"""

from typing import Union, Optional
from datetime import date, datetime


def parse_birth_code(birth_code: str, reference_year: int) -> Optional[dict]:
    """
    Pure function: Parse the 6-digit birth code from NIK into birth date components.

    For female NIK holders, the day code has 40 added (e.g., 64 → 24).
    This function handles that normalization.

    Parameters:
        birth_code: 6-digit string from NIK positions [6:12] (DDMMYY)
        reference_year: The current year (passed in, not datetime.now())

    Returns:
        dict with keys: day, month, year, is_female, formatted
        None if birth_code is invalid

    Examples:
        >>> parse_birth_code("010164", 2026)
        {'day': 1, 'month': 1, 'year': 1964, 'is_female': False, 'formatted': '01 January 1964'}

        >>> parse_birth_code("640164", 2026)
        {'day': 24, 'month': 1, 'year': 1964, 'is_female': True, 'formatted': '24 January 1964'}
    """
    if len(birth_code) != 6:
        return None

    day_code = int(birth_code[:2])
    is_female = day_code > 31

    if is_female:
        day_code = day_code - 40

    if day_code < 1 or day_code > 31:
        return None

    month = int(birth_code[2:4])
    if month < 1 or month > 12:
        return None

    year_short = int(birth_code[4:6])

    # Resolve century: if the full year would be in the future, it's 1900s
    year = 2000 + year_short
    if year > reference_year:
        year = 1900 + year_short

    # Validate the date
    try:
        dt = date(year, month, day_code)
    except ValueError:
        return None

    # Format using English month names (locale-independent)
    month_names = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    formatted = f"{day_code:02d} {month_names[month]} {year}"

    return {
        'day': day_code,
        'month': month,
        'year': year,
        'is_female': is_female,
        'formatted': formatted,
    }


def extract_gender(day_code: int) -> str:
    """
    Pure function: Determine gender from the day code in NIK positions [6:8].

    Male: day code 1-31
    Female: day code 41-71 (40 + actual day)

    Parameters:
        day_code: The integer value of NIK[6:8]

    Returns:
        "Male" or "Female"

    Raises:
        ValueError if day_code is not in valid ranges
    """
    if 1 <= day_code <= 31:
        return "Male"
    elif 41 <= day_code <= 71:
        return "Female"
    else:
        raise ValueError(
            f"Invalid day code {day_code}: must be between 1-31 (Male) or 41-71 (Female)"
        )


def extract_region_code(idnum: str) -> dict:
    """
    Pure function: Extract province, city, and district codes from a validated 16-digit ID number.

    Parameters:
        idnum: 16-digit string (already validated for length)

    Returns:
        dict with keys: province_code, city_code, district_code
    """
    return {
        'province_code': int(idnum[:2]),
        'city_code': int(idnum[:4]),
        'district_code': int(idnum[:6]),
    }


def extract_nth_person(idnum: str) -> int:
    """
    Pure function: Extract the registration sequence number from NIK positions [13:16].

    Parameters:
        idnum: 16-digit string (already validated for length)

    Returns:
        Registration sequence number as integer
    """
    return int(idnum[13:])


def validate_nik_length(idnum: Union[str, int]) -> str:
    """
    Pure function: Validate that NIK is exactly 16 digits.

    Parameters:
        idnum: NIK as string or integer

    Returns:
        NIK as 16-digit string

    Raises:
        ValueError if NIK is not 16 digits
    """
    idnum = str(idnum)
    if len(idnum) == 16:
        return idnum
    elif len(idnum) < 16:
        raise ValueError(
            f'Identification number (NIK) is too short ({len(idnum)} characters), length should be 16'
        )
    else:
        raise ValueError(
            f'Identification number (NIK) is too long ({len(idnum)} characters), length should be 16'
        )


def calculate_age(birth_year: int, birth_month: int, birth_day: int, reference_date: date) -> int:
    """
    Pure function: Calculate age from birth date components and a reference date.

    This is the pure extraction of nik.age() — instead of using date.today(),
    the reference date is passed as a parameter.

    Parameters:
        birth_year: Year of birth
        birth_month: Month of birth (1-12)
        birth_day: Day of birth (1-31)
        reference_date: The date to calculate age as of

    Returns:
        Age in years as integer
    """
    return reference_date.year - birth_year - (
        (reference_date.month, reference_date.day) < (birth_month, birth_day)
    )
