from typing import List
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime, date

from backend.database import investments_collection
from backend.entity.investment import Investment
from backend.entity.periodic_payment import EntryType
from backend.repository.investment_repository import InvestmentRepository
from backend.repository.periodic_payment_repository import PeriodicPaymentRepository

router = APIRouter(prefix="/investments", tags=["Investments"])

@router.get("/statistics")
def calculate_statistics():
    try:
        cursor = investments_collection.find()

        investments = []
        amount_invested_sum = 0.0
        approximate_current_value_sum = 0.0

        for inv in cursor:
            investment = {
                "id": str(inv["_id"]),
                "name": inv.get("name", ""),
                "amount_invested": float(inv.get("amount_invested", 0)),
                "approximate_current_value": float(inv.get("approximate_current_value", 0)),
                "type": inv.get("type", ""),
                "acquisition_date": str(inv.get("acquisition_date", 0)),
                "maturity_date": str(inv.get("maturity_date", 0)),
                "periodic_payments": [
                    {
                        "type": p.get("type"),
                        "amount": float(p.get("amount", 0)),
                        "payment_date": str(p.get("payment_date"))
                    } for p in inv.get("periodic_payments", [])
                ]
            }

            amount_invested_sum += investment["amount_invested"]
            approximate_current_value_sum += investment["approximate_current_value"]
            investments.append(investment)

        return {
            "amount_invested_sum": amount_invested_sum,
            "approximate_current_value_sum": approximate_current_value_sum,
            "investments": investments
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating investment statistics: {str(e)}")


@router.post("/")
def register_investment(investment: Investment):
    investment_dict = investment.model_dump()
    investment_dict["acquisition_date"] = datetime.combine(investment.acquisition_date, datetime.min.time())
    investment_dict["maturity_date"] = datetime.combine(investment.maturity_date, datetime.min.time())

    if "periodic_payments" in investment_dict:
        for payment in investment_dict["periodic_payments"]:
            if isinstance(payment["payment_date"], date):
                payment["payment_date"] = datetime.combine(
                    payment["payment_date"], datetime.min.time()
                )

    result = investments_collection.insert_one(investment_dict)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Error saving investment.")
    return {"id": str(result.inserted_id), "msg": "Investment saved successfully!"}


@router.post("/batch")
def register_investments_batch(investments: List[Investment]):
    if not investments:
        raise HTTPException(status_code=400, detail="No investments provided")

    try:
        investments_dicts = []
        for inv in investments:
            investment_dict = inv.model_dump()
            investment_dict["acquisition_date"] = datetime.combine(inv.acquisition_date, datetime.min.time())
            investment_dict["maturity_date"] = datetime.combine(inv.maturity_date, datetime.min.time())
            investment_dict["approximate_current_value_last_update"] = datetime.now()

            if "periodic_payments" in investment_dict:
                for payment in investment_dict["periodic_payments"]:
                    if isinstance(payment["payment_date"], date):
                        payment["payment_date"] = datetime.combine(
                            payment["payment_date"], datetime.min.time()
                        )
            investments_dicts.append(investment_dict)

        result = investments_collection.insert_many(investments_dicts)

        inserted_ids = [str(_id) for _id in result.inserted_ids]

        return {"inserted_count": len(inserted_ids), "inserted_ids": inserted_ids}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inserting investments: {str(e)}")


@router.get("/monthly")
def get_investments_by_month(
    year: int = Query(..., ge=1900),
    month: int = Query(..., ge=1, le=12)
):
    try:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        investments_cursor = InvestmentRepository.find_by_maturity_date_range(start_date, end_date)
        periodic_payments_cursor = PeriodicPaymentRepository.find_by_payment_date_range(start_date, end_date)

        events = []
        total_interest = 0.0
        total_amortization = 0.0
        total_amount = 0.0

        for inv in investments_cursor:
            inv["id"] = str(inv["_id"])
            del inv["_id"]

            inv["type"] = "maturity"

            total_amount += inv.get("amount_invested", 0.0)

            inv["amount"] = inv.get("amount_invested", 0.0)
            del inv["amount_invested"]

            events.append(inv)

        for payment in periodic_payments_cursor:
            if payment["type"] == EntryType.INTEREST:
                total_interest += payment["amount"]
            else: # EntryType.AMORTIZATION
                total_amortization += payment["amount"]

            events.append({
                "name": payment["name"],
                "maturity_date": payment["payment_date"],
                "type": payment["type"],
                "amount": payment["amount"],
            })

        return {
            "year": year,
            "month": month,
            "events": events,
            "total_interest": total_interest,
            "total_amortization": total_amortization,
            "total_maturity_amount": total_amount,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly investments: {str(e)}")


@router.get("/{investment_id}")
def get_investment(investment_id: str):
    if not ObjectId.is_valid(investment_id):
        raise HTTPException(status_code=400, detail="Invalid investment ID.")

    investment = investments_collection.find_one({"_id": ObjectId(investment_id)})
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found.")

    # Convert ObjectId to string for JSON serialization
    investment["id"] = str(investment["_id"])
    del investment["_id"]

    return investment


@router.get("/")
def list_investments(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1)):
    investments_cursor = investments_collection.find().skip(skip).limit(limit)
    investments = []

    for inv in investments_cursor:
        inv["id"] = str(inv["_id"])
        del inv["_id"]
        investments.append(inv)

    return {
        "skip": skip,
        "limit": limit,
        "total": investments_collection.count_documents({}),
        "investments": investments
    }


@router.delete("/")
def delete_all_investments():
    result = investments_collection.delete_many({})

    if result.deleted_count == 0:
        return {"msg": "No investments found for deletion."}

    return {"msg": f"{result.deleted_count} investment(s) deleted successfully."}


@router.delete("/{investment_id}")
def delete_investment(investment_id: str):
    try:
        obj_id = ObjectId(investment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID.")

    result = investments_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found.")

    return {"msg": "Investment deleted successfully."}
