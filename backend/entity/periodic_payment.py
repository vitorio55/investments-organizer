from pydantic import BaseModel
from datetime import date
from enum import Enum

class EntryType(str, Enum):
    INTEREST = "interest"
    AMORTIZATION = "amortization"

class PeriodicPayment(BaseModel):
    type: EntryType
    amount: float
    payment_date: date