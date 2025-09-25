from datetime import datetime
from backend.database import investments_collection

class InvestmentRepository:

    @staticmethod
    def find_by_maturity_date_range(start_date: datetime, end_date: datetime):
        cursor = investments_collection.find(
            {
                "maturity_date": {"$gte": start_date, "$lt": end_date}
            }
        )
        return list(cursor)