from enum import Enum

class InvestmentType(str, Enum):
    CRI = "CRI"
    CRA = "CRA"
    LCA = "LCA"
    LCI = "LCI"
    DEBENTURE = "Debenture"
    TESOURO_DIRETO = "Tesouro Direto"
    CDB = "CDB"
    FUNDO_DE_INVESTIMENTO = "Fundo de Investimento"
    MOEDA = "Moeda"
