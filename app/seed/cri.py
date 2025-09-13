import logging
from datetime import datetime, date
from enum import Enum

from entity.investimento import Investimento
from entity.tipo_investimento import TipoInvestimento
from database import investimentos_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def carregar_investimentos_exemplo_cri():
    if investimentos_collection.count_documents({}) <= 8:
        exemplos = [
            Investimento(
                nome="CDB Banco X",
                tipo=TipoInvestimento.CRI,
                data_aquisicao=date(2023, 9, 1),
                data_vencimento=date(2026, 9, 1),
                quantia=10000.0,
                pagamentos_periodicos=[
                    {
                        "tipo": "juros",
                        "quantia": 500,
                        "data": date(2023, 12, 1)
                    },
                    {
                        "tipo": "amortizacao",
                        "quantia": 1000.50,
                        "data": date(2024, 3, 1)
                    }
                ]
            )
        ]

        docs = []
        for inv in exemplos:
            inv_dict = inv.model_dump()
            inv_dict["data_aquisicao"] = datetime.combine(inv.data_aquisicao, datetime.min.time())
            inv_dict["data_vencimento"] = datetime.combine(inv.data_vencimento, datetime.min.time())

            # Converte pagamentos_periodicos
            pagamentos_convertidos = []
            for p in inv_dict.get("pagamentos_periodicos", []):
                pagamentos_convertidos.append({
                    "tipo": str(p["tipo"]) if isinstance(p["tipo"], Enum) else p["tipo"],
                    "quantia": float(p["quantia"]),
                    "data": datetime.combine(p["data"], datetime.min.time()) if isinstance(p["data"], date) else p["data"]
                })
            inv_dict["pagamentos_periodicos"] = pagamentos_convertidos

            docs.append(inv_dict)

        investimentos_collection.insert_many(docs)
        logger.info("✅ Investimentos de exemplo CRI inseridos no MongoDB")
    else:
        logger.info("❗❗❗ Investimentos de exemplo CRI NÃO inseridos no MongoDB")