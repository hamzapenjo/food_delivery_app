from enum import Enum

class DriverStatus(str, Enum):
    available = "available"
    busy = "busy"
    inactive = "inactive"
    active = "active"