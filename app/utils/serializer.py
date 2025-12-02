from bson import ObjectId

def serialize_value(value):
    """Convert ObjectId and nested structures recursively."""
    if isinstance(value, ObjectId):
        return str(value)
    elif isinstance(value, list):
        return [serialize_value(item) for item in value]
    elif isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    return value


def serialize_doc(doc):
    """Serialize a MongoDB document or list of documents."""
    return serialize_value(doc)
