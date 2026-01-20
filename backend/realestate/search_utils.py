"""
Search utilities for flexible/fuzzy location matching.

This module provides text normalization and Albanian location variation
expansion to improve search results when users type different spellings.
"""

import unicodedata
from django.db.models import Q


def normalize_text(text):
    """
    Normalize text for search comparison.

    - Strips accents/diacritics
    - Converts to lowercase
    - Normalizes whitespace

    Args:
        text: Input string to normalize

    Returns:
        Normalized string
    """
    if not text:
        return ""

    # Normalize unicode and remove accents
    normalized = unicodedata.normalize('NFD', text)
    without_accents = ''.join(
        char for char in normalized
        if unicodedata.category(char) != 'Mn'
    )

    # Lowercase and strip whitespace
    return ' '.join(without_accents.lower().split())


# Albanian location spelling variations
# Maps normalized base form to set of variations
ALBANIAN_LOCATION_VARIATIONS = {
    # Capital and major cities
    'tirana': {'tirana', 'tirane', 'tirona'},
    'tirane': {'tirana', 'tirane', 'tirona'},

    'vlora': {'vlora', 'vlore', 'vlore'},
    'vlore': {'vlora', 'vlore', 'vlore'},

    'shkodra': {'shkodra', 'shkoder', 'shkodre'},
    'shkoder': {'shkodra', 'shkoder', 'shkodre'},

    'durres': {'durres', 'durresi', 'durrs'},
    'durresi': {'durres', 'durresi', 'durrs'},

    'elbasan': {'elbasan', 'elbasani'},
    'elbasani': {'elbasan', 'elbasani'},

    'korce': {'korce', 'korca', 'korcha'},
    'korca': {'korce', 'korca', 'korcha'},

    'fier': {'fier', 'fieri'},
    'fieri': {'fier', 'fieri'},

    'berat': {'berat', 'berati'},
    'berati': {'berat', 'berati'},

    'lushnje': {'lushnje', 'lushnja'},
    'lushnja': {'lushnje', 'lushnja'},

    'pogradec': {'pogradec', 'pogradeci'},
    'pogradeci': {'pogradec', 'pogradeci'},

    'kavaje': {'kavaje', 'kavaja'},
    'kavaja': {'kavaje', 'kavaja'},

    'gjirokaster': {'gjirokaster', 'gjirokastra', 'gjirokastre'},
    'gjirokastra': {'gjirokaster', 'gjirokastra', 'gjirokastre'},

    'sarande': {'sarande', 'saranda', 'sarand'},
    'saranda': {'sarande', 'saranda', 'sarand'},

    'lezhe': {'lezhe', 'lezha'},
    'lezha': {'lezhe', 'lezha'},

    'kukes': {'kukes', 'kukesi'},
    'kukesi': {'kukes', 'kukesi'},

    'peshkopi': {'peshkopi', 'peshkopia'},
    'peshkopia': {'peshkopi', 'peshkopia'},

    'permet': {'permet', 'permeti'},
    'permeti': {'permet', 'permeti'},

    'tepelene': {'tepelene', 'tepelena'},
    'tepelena': {'tepelene', 'tepelena'},

    'kruje': {'kruje', 'kruja'},
    'kruja': {'kruje', 'kruja'},
}


def get_search_variations(search_term):
    """
    Get all spelling variations for a search term.

    Looks up the normalized search term in the variations dictionary
    and returns all known spellings. If not found, returns just the
    original normalized term.

    Args:
        search_term: The user's search input

    Returns:
        Set of search term variations to try
    """
    normalized = normalize_text(search_term)

    if not normalized:
        return set()

    # Check if we have known variations for this term
    if normalized in ALBANIAN_LOCATION_VARIATIONS:
        return ALBANIAN_LOCATION_VARIATIONS[normalized]

    # No known variations, return just the normalized term
    return {normalized}


def build_location_filter(search_term):
    """
    Build a Django Q object for fuzzy location matching.

    Creates an OR filter that searches both location_text and address
    fields for all variations of the search term.

    Args:
        search_term: The user's location search input

    Returns:
        Django Q object for filtering
    """
    variations = get_search_variations(search_term)

    if not variations:
        return Q()

    # Build OR conditions for each variation across both fields
    q_filter = Q()
    for variation in variations:
        q_filter |= Q(location_text__icontains=variation)
        q_filter |= Q(address__icontains=variation)

    return q_filter


def build_search_filter(search_term):
    """
    Build a Django Q object for fuzzy search matching.

    Creates an OR filter that searches title, location_text, and address
    fields for all variations of the search term.

    Args:
        search_term: The user's search query input

    Returns:
        Django Q object for filtering
    """
    variations = get_search_variations(search_term)

    if not variations:
        return Q()

    # Build OR conditions: title always uses original term,
    # location fields use all variations
    q_filter = Q(title__icontains=search_term)  # Keep title search with original term

    for variation in variations:
        q_filter |= Q(location_text__icontains=variation)
        q_filter |= Q(address__icontains=variation)

    return q_filter
