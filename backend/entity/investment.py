from pydantic import BaseModel
from datetime import date
from typing import List, Optional

from backend.entity.investment_type import InvestmentType
from backend.entity.periodic_payment import PeriodicPayment


class Investment(BaseModel):
    name: str
    type: InvestmentType
    acquisition_date: date
    maturity_date: date
    amount_invested: float
    approximate_current_value: Optional[float] = None
    platform: str
    periodic_payments: List[PeriodicPayment] = []
