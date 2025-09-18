import logging
from datetime import datetime, date
from enum import Enum

from backend.database import investments_collection
from backend.entity.investment_type import InvestmentType
from backend.entity.periodic_payment import EntryType, PeriodicPayment
from backend.entity.investment import Investment

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SHOULD_NOT_SEED = True

def load_cri_seed_investments():
    if investments_collection.count_documents({}) > 6 or SHOULD_NOT_SEED:
        logger.info(f"❗❗❗ CRI seed investments not inserted into MongoDB (SHOULD_NOT_SEED={SHOULD_NOT_SEED})")
        return

    seed_investments = [
        Investment(
            name="CDB Banco X",
            type=InvestmentType.CRI,
            acquisition_date=date(2023, 9, 1),
            maturity_date=date(2026, 9, 1),
            amount=10000.0,
            periodic_payments=[
                PeriodicPayment(type=EntryType.INTEREST, amount=500, payment_date=date(2023, 12, 1)),
                PeriodicPayment(type=EntryType.AMORTIZATION, amount=1000.50, payment_date=date(2024, 3, 1)),
            ]
        )
    ]

    docs = []
    for inv in seed_investments:
        inv_dict = inv.model_dump()
        inv_dict["acquisition_date"] = datetime.combine(inv.acquisition_date, datetime.min.time())
        inv_dict["maturity_date"] = datetime.combine(inv.maturity_date, datetime.min.time())

        converted_periodic_payments = []
        for p in inv_dict.get("periodic_payments", []):
            converted_periodic_payments.append({
                "type": p["type"].value if isinstance(p["type"], Enum) else p["type"],
                "amount": float(p["amount"]),
                "payment_date": datetime.combine(p["payment_date"], datetime.min.time()) if isinstance(
                    p["payment_date"], date) else p["payment_date"]
            })
        inv_dict["periodic_payments"] = converted_periodic_payments

        docs.append(inv_dict)

    investments_collection.insert_many(docs)
    logger.info("✅ CRI seed investments inserted into MongoDB")
