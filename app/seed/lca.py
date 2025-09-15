import logging
from datetime import datetime, date

from entity.investment_type import InvestmentType
from entity.investment import Investment
from database import investments_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_lca_seed_investments():
    if investments_collection.count_documents({}) > 8:
        logger.info("❗❗❗ LCA seed investments not inserted into MongoDB")
        return

    seed_investments = [
        Investment(
            name="CDB Banco X",
            type=InvestmentType.LCA,
            acquisition_date=date(2023, 9, 1),
            maturity_date=date(2026, 9, 1),
            amount=10000.0
        )
    ]

    docs = []
    for inv in seed_investments:
        inv_dict = inv.model_dump()
        inv_dict["acquisition_date"] = datetime.combine(inv.acquisition_date, datetime.min.time())
        inv_dict["maturity_date"] = datetime.combine(inv.maturity_date, datetime.min.time())
        docs.append(inv_dict)

    investments_collection.insert_many(docs)
    logger.info("✅ LCA seed investments inserted into MongoDB")