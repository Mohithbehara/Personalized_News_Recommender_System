import math

def cosine_similarity(vec1: dict, vec2: dict) -> float:
    """Compute cosine similarity between two user vectors"""

    # Common keys between users
    common_keys = set(vec1.keys()).intersection(set(vec2.keys()))

    if not common_keys:
        return 0.0

    dot_product = sum(vec1[k] * vec2[k] for k in common_keys)
    norm1 = math.sqrt(sum(v * v for v in vec1.values()))
    norm2 = math.sqrt(sum(v * v for v in vec2.values()))

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot_product / (norm1 * norm2)
