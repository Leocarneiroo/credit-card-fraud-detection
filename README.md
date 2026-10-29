# Detecção de Fraude em Cartão de Crédito

Modelo de classificação para priorizar transações suspeitas numa base em que só **0,173%** das transações são fraude. O projeto usa **validação temporal sem vazamento**, compara **Regressão Logística e Random Forest** pela **Average Precision** e define o **limiar de decisão por F2**, dando mais peso ao recall.

> Projeto final do curso **Profissão: Cientista de Dados (EBAC)**, concluído em outubro de 2026.

## Problema

Uma fraude não detectada sai mais cara que um alerta falso, mas alertas demais sobrecarregam a equipe de revisão. Por isso o objetivo **não é acurácia**: um modelo que diz "legítima" para tudo acerta 99,8% e não serve para nada. Busquei um modelo que **ordene bem as transações por risco** e um **ponto de corte** que equilibre fraudes capturadas e alertas falsos.

## Dados

- **Fonte:** [Credit Card Fraud Detection, ULB Machine Learning Group (Kaggle)](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud). O CSV (cerca de 144 MB) **não é versionado**. Veja [`data/README.md`](data/README.md).
- **284.807 transações × 31 colunas:**
  - `Time`: segundos desde a primeira transação, numa janela de cerca de 48 h.
  - `V1`–`V28`: componentes PCA anonimizados.
  - `Amount`: valor da transação.
  - `Class`: 1 = fraude.
- **492 fraudes (0,173%)**, uma proporção de cerca de 578 legítimas para cada fraude.
- Não há valores ausentes nem colunas categóricas. As **1.081 linhas duplicadas foram mantidas**, porque podem ser transações repetidas legítimas e não há identificador para confirmar.

## Abordagem

1. **Auditoria de qualidade:** tipos, nulos, duplicatas e ordenação de `Time`.
2. **EDA em 6 frentes:**
   - qualidade dos dados;
   - desbalanceamento do alvo;
   - distribuição de `Amount`: a média é maior nas fraudes (122,21 contra 88,29), mas a mediana é menor (9,25 contra 22,00);
   - correlação com o alvo: V17, V14 e V12 se destacam;
   - comportamento no tempo;
   - distribuição das features por classe.
3. **Partição temporal 70/15/15 por `Time`.** Cada instante fica numa única partição, o que simula prever o futuro com dados do passado.

   | Partição | Transações | Fraudes |
   |---|---:|---:|
   | Treino | 199.368 | 384 |
   | Validação | 42.718 | 56 |
   | Teste | 42.721 | 52 |

4. **Pipelines do scikit-learn.** O `StandardScaler` é ajustado **só no treino**. O desbalanceamento é tratado com `class_weight`.
   - `LogisticRegression(class_weight="balanced")`
   - `RandomForestClassifier(n_estimators=160, max_depth=14, min_samples_leaf=2, class_weight="balanced_subsample")`
5. **Seleção do modelo na validação por Average Precision** (área sob a curva Precisão-Recall), a métrica adequada para classe rara.
6. **Limiar escolhido por F2 na validação:** 0,143. Em seguida veio **uma única avaliação no teste**.

## Resultados

**Validação**

| Modelo | Average Precision | ROC-AUC |
|---|---:|---:|
| Regressão Logística | 0,839 | 0,983 |
| **Random Forest** ✅ | **0,870** | 0,975 |

**Teste (Random Forest, limiar 0,143)**

| Métrica | Valor |
|---|---:|
| Average Precision | **0,773** |
| ROC-AUC | 0,957 |
| Precisão | 0,684 |
| Recall | 0,750 |
| F1 | 0,716 |
| F2 | 0,736 |

O modelo capturou **39 das 52 fraudes** do teste, com **18 alertas falsos** em 42.669 transações legítimas, e deixou passar 13 fraudes.

Variáveis mais importantes: V14 (0,170), V10 (0,142), V12 (0,112), V17 (0,097) e V4 (0,093).

![Curva Precisão-Recall](imagens/07_pr.png)
![Matriz de confusão](imagens/08_confusao.png)

Uma apresentação executiva em HTML, com 15 slides, está em [`apresentacao/`](apresentacao/index.html). Baixe a pasta e abra o `index.html` no navegador.

### Recomendação de negócio

O modelo deve ser usado como **triagem para revisão humana**, não como bloqueio automático. O limiar pode ser recalibrado conforme o custo real de uma fraude perdida e de um alerta falso.

### Limitações

- A janela é de só cerca de 48 h, e o teste tem apenas 52 fraudes, então as métricas têm alta variância.
- As features V1–V28 são anonimizadas, o que limita a interpretação de negócio.
- Não houve busca de hiperparâmetros. A queda de AP entre validação (0,87) e teste (0,77) sugere possível mudança de padrão ao longo do tempo.

## Como executar

```bash
git clone https://github.com/Leocarneiroo/credit-card-fraud-detection.git
cd credit-card-fraud-detection
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# baixe creditcard.csv do Kaggle para data/ (veja data/README.md)
jupyter notebook Analise_Fraude_Cartao.ipynb
```

As figuras são salvas em `imagens/`.

## Estrutura

```
├── Analise_Fraude_Cartao.ipynb   # notebook completo (EDA → modelo → avaliação)
├── imagens/                      # 9 figuras usadas no README e na apresentação
├── apresentacao/                 # apresentação em HTML (15 slides): abra apresentacao/index.html
├── data/README.md                # como obter o CSV
├── requirements.txt
└── LICENSE
```

## Stack

Python 3.13 · pandas · NumPy · scikit-learn · matplotlib · seaborn · Jupyter

## Autor

**Leonardo Carneiro**: [GitHub](https://github.com/Leocarneiroo) · [LinkedIn](https://www.linkedin.com/in/leocarneirooo)
