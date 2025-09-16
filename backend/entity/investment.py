from pydantic import BaseModel
from datetime import date
from typing import List

from backend.entity.investment_type import InvestmentType
from backend.entity.periodic_payment import PeriodicPayment


class Investment(BaseModel):
    name: str
    type: InvestmentType
    acquisition_date: date
    maturity_date: date
    amount: float
    periodic_payments: List[PeriodicPayment] = []  # default vazio
