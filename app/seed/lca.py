import logging
from datetime import datetime, date

from entity.tipo_investimento import TipoInvestimento
from entity.investimento import Investimento
from database import investimentos_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def carregar_investimentos_exemplo_lca():
    if investimentos_collection.count_documents({}) <= 8:
        exemplos = [
            Investimento(
                nome="CDB Banco X",
                tipo=TipoInvestimento.LCA,
                data_aquisicao=date(2023, 9, 1),
                data_vencimento=date(2026, 9, 1),
                quantia=10000.0
            )
        ]

        docs = []
        for inv in exemplos:
            inv_dict = inv.model_dump()
            inv_dict["data_aquisicao"] = datetime.combine(inv.data_aquisicao, datetime.min.time())
            inv_dict["data_vencimento"] = datetime.combine(inv.data_vencimento, datetime.min.time())
            docs.append(inv_dict)

        investimentos_collection.insert_many(docs)
        logger.info("✅ Investimentos de exemplo LCA inseridos no MongoDB")
    else:
        logger.info("❗❗❗ Investimentos de exemplo LCA NÃO inseridos no MongoDB")