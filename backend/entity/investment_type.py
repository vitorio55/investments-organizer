from enum import Enum

class InvestmentType(str, Enum):
    CDB = "CDB"
    CRA = "CRA"
    CRI = "CRI"
    LCA = "LCA"
    LCI = "LCI"
    DEBENTURE = "Debenture"
    TESOURO_DIRETO = "Tesouro Direto"
    FUNDO_DE_INVESTIMENTO = "Fundo de Investimento"
    MOEDA = "Moeda"
