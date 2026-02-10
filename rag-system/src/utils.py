"""
Utility functions for GeneVision RAG System
"""

import re
import time
from typing import Any, Dict
from functools import wraps


def extract_gene_symbol(allele_string: str) -> str:
    """
    Extract gene symbol from allele notation.

    Examples:
        'Lep<ob>' -> 'Lep'
        'Tyr<tm1Tyj>' -> 'Tyr'
        'Kit<W>' -> 'Kit'

    Args:
        allele_string: Allele notation string

    Returns:
        Gene symbol
    """
    if not allele_string:
        return ""

    # Extract everything before '<' or first special character
    match = re.match(r"^([A-Za-z0-9]+)", allele_string)
    if match:
        return match.group(1)
    return allele_string


def timing_decorator(func):
    """Decorator to measure function execution time"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        elapsed_ms = (end - start) * 1000
        print(f"⏱️  {func.__name__} took {elapsed_ms:.2f}ms")
        return result

    return wrapper


def format_time_ms(start_time: float) -> float:
    """Calculate elapsed time in milliseconds"""
    return (time.time() - start_time) * 1000


def clean_text(text: str) -> str:
    """Clean and normalize text for embedding"""
    if not text:
        return ""

    # Remove extra whitespace
    text = " ".join(text.split())

    # Remove special characters but keep basic punctuation
    text = re.sub(r"[^\w\s\-,.]", " ", text)

    return text.strip()


def deduplicate_list(items: list) -> list:
    """Remove duplicates while preserving order"""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float"""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def truncate_string(text: str, max_length: int = 100) -> str:
    """Truncate string with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."
