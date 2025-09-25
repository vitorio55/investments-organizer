from datetime import datetime
from backend.database import investments_collection

class PeriodicPaymentRepository:

    @staticmethod
    def find_by_payment_date_range(start_date: datetime, end_date: datetime):
        pipeline = [
            {"$unwind": "$periodic_payments"},
            {
                "$match": {
                    "periodic_payments.payment_date": {
                        "$gte": start_date,
                        "$lt": end_date
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "name": 1,
                    "type": "$periodic_payments.type",
                    "amount": "$periodic_payments.amount",
                    "payment_date": "$periodic_payments.payment_date"
                }
            }
        ]

        cursor = investments_collection.aggregate(pipeline)
        return list(cursor)