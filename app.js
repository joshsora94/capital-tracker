console.log("Capital Tracker v4 啟動成功");


// ==========================
// HTML 元素
// ==========================

const totalAssets =
    document.getElementById("totalAssets");

const profit =
    document.getElementById("profit");

const returnRate =
    document.getElementById("returnRate");

const totalDeposit =
    document.getElementById("totalDeposit");

const totalWithdraw =
    document.getElementById("totalWithdraw");

const netDeposit =
    document.getElementById("netDeposit");

const cash =
    document.getElementById("cash");

const stockValue =
    document.getElementById("stockValue");

const holdingList =
    document.getElementById("holdingList");

const holdingCount =
    document.getElementById("holdingCount");

const recordList =
    document.getElementById("recordList");

const recordCount =
    document.getElementById("recordCount");


// Modal

const modal =
    document.getElementById("modal");

const modalTitle =
    document.getElementById("modalTitle");

const addButton =
    document.getElementById("addButton");

const closeButton =
    document.getElementById("closeButton");

const cancelButton =
    document.getElementById("cancelButton");

const transactionForm =
    document.getElementById("transactionForm");

const formError =
    document.getElementById("formError");


// 表單

const typeInput =
    document.getElementById("type");

const amountField =
    document.getElementById("amountField");

const amountInput =
    document.getElementById("amount");

const amountLabel =
    document.getElementById("amountLabel");

const stockNameField =
    document.getElementById("stockNameField");

const stockNameInput =
    document.getElementById("stockName");

const stockSuggestions =
    document.getElementById("stockSuggestions");

const buySharesField =
    document.getElementById("buySharesField");

const buySharesInput =
    document.getElementById("buyShares");

const sellSharesField =
    document.getElementById("sellSharesField");

const sellSharesInput =
    document.getElementById("sellShares");

const sellSharesHint =
    document.getElementById("sellSharesHint");

const pnlField =
    document.getElementById("pnlField");

const profitButton =
    document.getElementById("profitButton");

const lossButton =
    document.getElementById("lossButton");

const pnlAmountInput =
    document.getElementById("pnlAmount");

const dateInput =
    document.getElementById("date");

const noteInput =
    document.getElementById("note");


// 資料管理

const manageButton =
    document.getElementById("manageButton");

const manageModal =
    document.getElementById("manageModal");

const closeManageButton =
    document.getElementById("closeManageButton");

const backupButton =
    document.getElementById("backupButton");

const csvButton =
    document.getElementById("csvButton");

const importButton =
    document.getElementById("importButton");

const importFile =
    document.getElementById("importFile");

const resetButton =
    document.getElementById("resetButton");

const toast =
    document.getElementById("toast");


// ==========================
// Storage
// ==========================

const STORAGE_KEY =
    "capital_tracker_transactions_v4";

let transactions =
    loadTransactions();

let editingId =
    null;

let pnlType =
    "profit";


// ==========================
// 載入資料
// ==========================

function loadTransactions() {

    const current =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!current) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(
                current
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(error);

        return [];

    }

}


// ==========================
// 日期
// ==========================

function getTodayString() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


function setToday() {

    dateInput.value =
        getTodayString();

}


// ==========================
// 共用工具
// ==========================

function formatMoney(
    number
) {

    const value =
        Number(number) || 0;

    const sign =
        value < 0
            ? "-"
            : "";


    return (
        sign +
        "NT$ " +
        Math.abs(
            Math.round(value)
        ).toLocaleString(
            "zh-TW"
        )
    );

}


function formatMoneyDecimal(
    number
) {

    const value =
        Number(number) || 0;


    return (
        "NT$ " +
        value.toLocaleString(
            "zh-TW",
            {
                minimumFractionDigits:
                    Number.isInteger(value)
                        ? 0
                        : 2,

                maximumFractionDigits:
                    2
            }
        )
    );

}


function formatSignedMoney(
    number
) {

    const value =
        Number(number) || 0;


    if (
        value > 0
    ) {

        return (
            "+" +
            formatMoney(
                value
            )
        );

    }


    return formatMoney(
        value
    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function normalizeStockName(
    value
) {

    return String(
        value || ""
    ).trim();

}


function saveTransactions() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            transactions
        )
    );

}


function showToast(
    message
) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            1800
        );

}


function setProfitClass(
    element,
    value
) {

    element.classList.remove(
        "positive",
        "negative",
        "neutral"
    );


    if (
        value > 0
    ) {

        element.classList.add(
            "positive"
        );

    }

    else if (
        value < 0
    ) {

        element.classList.add(
            "negative"
        );

    }

    else {

        element.classList.add(
            "neutral"
        );

    }

}


// ==========================
// 損益類型
// ==========================

function setPnlType(
    type
) {

    pnlType =
        type;


    profitButton
        .classList
        .toggle(
            "selected",
            type === "profit"
        );


    lossButton
        .classList
        .toggle(
            "selected",
            type === "loss"
        );

}


// ==========================
// 表單切換
// ==========================

function updateFormFields() {

    const type =
        typeInput.value;


    stockNameField.style.display =
        "none";

    buySharesField.style.display =
        "none";

    amountField.style.display =
        "block";

    sellSharesField.style.display =
        "none";

    pnlField.style.display =
        "none";


    amountLabel.textContent =
        "金額";

    amountInput.placeholder =
        "例如：50000";


    if (
        type === "buy"
    ) {

        stockNameField.style.display =
            "block";

        buySharesField.style.display =
            "block";

        amountLabel.textContent =
            "花費金額";

        amountInput.placeholder =
            "例如：30000";

    }


    if (
        type === "sell"
    ) {

        stockNameField.style.display =
            "block";

        amountField.style.display =
            "none";

        sellSharesField.style.display =
            "block";

        pnlField.style.display =
            "block";

        updateSellSharesHint();

    }

}


// ==========================
// 錯誤提示
// ==========================

function clearFormError() {

    formError.hidden =
        true;

    formError.textContent =
        "";

}


function showFormError(
    message
) {

    formError.textContent =
        message;

    formError.hidden =
        false;

}


// ==========================
// Modal
// ==========================

function openAddModal() {

    editingId =
        null;

    modalTitle.textContent =
        "新增紀錄";

    transactionForm.reset();

    typeInput.value =
        "deposit";

    setToday();

    setPnlType(
        "profit"
    );

    clearFormError();

    updateFormFields();

    modal.classList.add(
        "show"
    );

}


function openEditModal(
    transaction
) {

    editingId =
        Number(
            transaction.id
        );

    modalTitle.textContent =
        "編輯紀錄";

    typeInput.value =
        transaction.type;

    dateInput.value =
        transaction.date;

    noteInput.value =
        transaction.note || "";

    stockNameInput.value =
        transaction.stockName || "";


    if (
        transaction.type ===
        "buy"
    ) {

        buySharesInput.value =
            transaction.shares;

        amountInput.value =
            transaction.amount;

    }

    else if (
        transaction.type ===
        "sell"
    ) {

        sellSharesInput.value =
            transaction.shares;


        const pnl =
            Number(
                transaction.pnl
            ) || 0;


        setPnlType(
            pnl < 0
                ? "loss"
                : "profit"
        );


        pnlAmountInput.value =
            Math.abs(
                pnl
            );

    }

    else {

        amountInput.value =
            transaction.amount;

    }


    clearFormError();

    updateFormFields();

    modal.classList.add(
        "show"
    );

}


function closeTransactionModal() {

    modal.classList.remove(
        "show"
    );

    editingId =
        null;

    clearFormError();

}


// ==========================
// 排序
// ==========================

function sortTransactions(
    items
) {

    return [
        ...items
    ].sort(
        function (
            a,
            b
        ) {

            const dateCompare =
                String(
                    a.date
                )
                .localeCompare(
                    String(
                        b.date
                    )
                );


            if (
                dateCompare !== 0
            ) {

                return dateCompare;

            }


            return (
                Number(
                    a.id
                )
                -
                Number(
                    b.id
                )
            );

        }
    );

}


// ==========================
// 帳戶運算核心
//
// 股票採平均成本法：
// 平均成本 = 持股成本 / 持有股數
// 賣出成本 = 平均成本 × 賣出股數
// 賣回現金 = 賣出成本 + 本次損益
// ==========================

function analyzeTransactions(
    items
) {

    let currentCash =
        0;

    let deposits =
        0;

    let withdrawals =
        0;

    const holdings =
        {};

    const derived =
        {};


    const ordered =
        sortTransactions(
            items
        );


    for (
        const transaction
        of ordered
    ) {


        // 入金
        if (
            transaction.type ===
            "deposit"
        ) {

            const amount =
                Number(
                    transaction.amount
                );


            if (
                !Number.isFinite(
                    amount
                )
                ||
                amount <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆入金金額不正確。`
                };

            }


            currentCash +=
                amount;

            deposits +=
                amount;

            continue;

        }


        // 出金
        if (
            transaction.type ===
            "withdraw"
        ) {

            const amount =
                Number(
                    transaction.amount
                );


            if (
                !Number.isFinite(
                    amount
                )
                ||
                amount <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆出金金額不正確。`
                };

            }


            if (
                amount >
                currentCash
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 出金 ${formatMoney(amount)}，但當時現金只有 ${formatMoney(currentCash)}。`
                };

            }


            currentCash -=
                amount;

            withdrawals +=
                amount;

            continue;

        }


        // 買入股票
        if (
            transaction.type ===
            "buy"
        ) {

            const stockName =
                normalizeStockName(
                    transaction.stockName
                );

            const amount =
                Number(
                    transaction.amount
                );

            const shares =
                Number(
                    transaction.shares
                );


            if (
                stockName === ""
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆買入沒有股票名稱。`
                };

            }


            if (
                !Number.isFinite(
                    amount
                )
                ||
                amount <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 的 ${stockName} 買入金額不正確。`
                };

            }


            if (
                !Number.isInteger(
                    shares
                )
                ||
                shares <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 的 ${stockName} 買入股數不正確。`
                };

            }


            if (
                amount >
                currentCash
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 買入 ${stockName} 需要 ${formatMoney(amount)}，但當時只有 ${formatMoney(currentCash)} 現金。`
                };

            }


            currentCash -=
                amount;


            if (
                !holdings[
                    stockName
                ]
            ) {

                holdings[
                    stockName
                ] =
                    {
                        shares: 0,
                        cost: 0
                    };

            }


            holdings[
                stockName
            ].shares +=
                shares;


            holdings[
                stockName
            ].cost +=
                amount;


            continue;

        }


        // 賣出股票
        if (
            transaction.type ===
            "sell"
        ) {

            const stockName =
                normalizeStockName(
                    transaction.stockName
                );

            const sellShares =
                Number(
                    transaction.shares
                );

            const pnl =
                Number(
                    transaction.pnl
                );


            if (
                stockName === ""
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆賣出沒有股票名稱。`
                };

            }


            if (
                !Number.isInteger(
                    sellShares
                )
                ||
                sellShares <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 的 ${stockName} 賣出股數不正確。`
                };

            }


            if (
                !Number.isFinite(
                    pnl
                )
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 的 ${stockName} 賣出損益格式不正確。`
                };

            }


            const holding =
                holdings[
                    stockName
                ];


            if (
                !holding
                ||
                holding.shares <= 0
                ||
                holding.cost <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 要賣出 ${stockName}，但當時沒有這檔股票的持股。`
                };

            }


            if (
                sellShares >
                holding.shares
            ) {

                return {
                    ok: false,
                    message:
                        `${stockName} 當時只有 ${holding.shares.toLocaleString("zh-TW")} 股，不能賣出 ${sellShares.toLocaleString("zh-TW")} 股。`
                };

            }


            const averageCost =
                holding.cost /
                holding.shares;


            let soldCost;


            if (
                sellShares ===
                holding.shares
            ) {

                soldCost =
                    holding.cost;

            }

            else {

                soldCost =
                    averageCost *
                    sellShares;

            }


            const proceeds =
                soldCost +
                pnl;


            if (
                proceeds < 0
            ) {

                return {
                    ok: false,
                    message:
                        `${stockName} 這次虧損不能大於賣出部分的原始成本 ${formatMoney(soldCost)}。`
                };

            }


            holding.shares -=
                sellShares;


            holding.cost -=
                soldCost;


            if (
                holding.shares === 0
            ) {

                holding.cost =
                    0;

            }


            currentCash +=
                proceeds;


            derived[
                String(
                    transaction.id
                )
            ] =
                {
                    sellShares:
                        sellShares,

                    averageCost:
                        averageCost,

                    soldCost:
                        soldCost,

                    pnl:
                        pnl,

                    proceeds:
                        proceeds
                };


            continue;

        }


        return {
            ok: false,
            message:
                "發現無法辨識的紀錄類型。"
        };

    }


    const currentStockCost =
        Object.values(
            holdings
        )
        .reduce(
            function (
                total,
                holding
            ) {

                return (
                    total +
                    Math.max(
                        0,
                        Number(
                            holding.cost
                        ) || 0
                    )
                );

            },
            0
        );


    const currentAssets =
        currentCash +
        currentStockCost;


    const netContribution =
        deposits -
        withdrawals;


    const totalProfit =
        currentAssets
        +
        withdrawals
        -
        deposits;


    const returnRate =
        deposits > 0

            ? (
                totalProfit /
                deposits
            ) * 100

            : 0;


    return {
        ok: true,

        deposits:
            deposits,

        withdrawals:
            withdrawals,

        netContribution:
            netContribution,

        currentCash:
            currentCash,

        currentStockCost:
            currentStockCost,

        currentAssets:
            currentAssets,

        totalProfit:
            totalProfit,

        returnRate:
            returnRate,

        holdings:
            holdings,

        derived:
            derived
    };

}


// ==========================
// 建立表單紀錄
// ==========================

function buildTransactionFromForm() {

    clearFormError();


    const type =
        typeInput.value;

    const date =
        dateInput.value;


    if (!date) {

        showFormError(
            "請選擇日期。"
        );

        return null;

    }


    const base = {

        id:
            editingId === null
                ? Date.now()
                : editingId,

        type:
            type,

        stockName:
            "",

        date:
            date,

        note:
            noteInput.value.trim()

    };


    // 入金 / 出金
    if (
        type === "deposit"
        ||
        type === "withdraw"
    ) {

        const amount =
            Number(
                amountInput.value
            );


        if (
            !Number.isFinite(
                amount
            )
            ||
            amount <= 0
        ) {

            showFormError(
                "請輸入大於 0 的正確金額。"
            );

            return null;

        }


        base.amount =
            amount;


        return base;

    }


    // 買入股票
    if (
        type === "buy"
    ) {

        const stockName =
            normalizeStockName(
                stockNameInput.value
            );

        const shares =
            Number(
                buySharesInput.value
            );

        const amount =
            Number(
                amountInput.value
            );


        if (
            stockName === ""
        ) {

            showFormError(
                "請輸入股票名稱。"
            );

            return null;

        }


        if (
            !Number.isInteger(
                shares
            )
            ||
            shares <= 0
        ) {

            showFormError(
                "請輸入大於 0 的整數買入股數。"
            );

            return null;

        }


        if (
            !Number.isFinite(
                amount
            )
            ||
            amount <= 0
        ) {

            showFormError(
                "請輸入大於 0 的花費金額。"
            );

            return null;

        }


        base.stockName =
            stockName;

        base.shares =
            shares;

        base.amount =
            amount;


        return base;

    }


    // 賣出股票
    if (
        type === "sell"
    ) {

        const stockName =
            normalizeStockName(
                stockNameInput.value
            );

        const shares =
            Number(
                sellSharesInput.value
            );

        const pnlAmount =
            Number(
                pnlAmountInput.value
            );


        if (
            stockName === ""
        ) {

            showFormError(
                "請輸入股票名稱。"
            );

            return null;

        }


        if (
            !Number.isInteger(
                shares
            )
            ||
            shares <= 0
        ) {

            showFormError(
                "請輸入大於 0 的整數賣出股數。"
            );

            return null;

        }


        if (
            pnlAmountInput.value.trim()
            === ""
            ||
            !Number.isFinite(
                pnlAmount
            )
            ||
            pnlAmount < 0
        ) {

            showFormError(
                "請輸入 0 或正數的損益金額。"
            );

            return null;

        }


        base.stockName =
            stockName;

        base.shares =
            shares;

        base.pnl =
            pnlType ===
            "loss"

                ? -Math.abs(
                    pnlAmount
                )

                : Math.abs(
                    pnlAmount
                );


        return base;

    }


    return null;

}


// ==========================
// 儲存 / 編輯
// ==========================

function saveFormTransaction() {

    const wasEditing =
        editingId !== null;


    const transaction =
        buildTransactionFromForm();


    if (!transaction) {

        return;

    }


    let candidate;


    if (
        editingId === null
    ) {

        candidate =
            [
                ...transactions,
                transaction
            ];

    }

    else {

        candidate =
            transactions.map(
                function (item) {

                    return (
                        Number(
                            item.id
                        )
                        ===
                        Number(
                            editingId
                        )
                    )

                        ? transaction

                        : item;

                }
            );

    }


    const analysis =
        analyzeTransactions(
            candidate
        );


    if (
        !analysis.ok
    ) {

        showFormError(
            analysis.message
        );

        return;

    }


    transactions =
        candidate;


    saveTransactions();


    updateUI();


    closeTransactionModal();


    showToast(
        wasEditing
            ? "已更新紀錄"
            : "已新增紀錄"
    );

}


// ==========================
// 股票名稱建議
// ==========================

function renderStockSuggestions() {

    const names =
        new Set();


    transactions.forEach(
        function (transaction) {

            const name =
                normalizeStockName(
                    transaction.stockName
                );


            if (name) {

                names.add(
                    name
                );

            }

        }
    );


    stockSuggestions.innerHTML =
        [
            ...names
        ]

        .sort(
            function (
                a,
                b
            ) {

                return a.localeCompare(
                    b,
                    "zh-Hant"
                );

            }
        )

        .map(
            function (
                name
            ) {

                return (
                    `<option value="${escapeHtml(name)}"></option>`
                );

            }
        )

        .join("");

}


// ==========================
// 賣出提示
// ==========================

function updateSellSharesHint() {

    const analysis =
        analyzeTransactions(
            transactions
        );


    if (
        !analysis.ok
    ) {

        sellSharesHint.textContent =
            "系統會依目前平均成本自動算出這次賣掉的原始成本。";

        return;

    }


    const stockName =
        normalizeStockName(
            stockNameInput.value
        );


    const holding =
        analysis.holdings[
            stockName
        ];


    if (
        !stockName
        ||
        !holding
        ||
        holding.shares <= 0
    ) {

        sellSharesHint.textContent =
            "系統會依目前平均成本自動算出這次賣掉的原始成本。";

        return;

    }


    const averageCost =
        holding.cost /
        holding.shares;


    sellSharesHint.textContent =

        `目前持有 ${holding.shares.toLocaleString("zh-TW")} 股，`

        +

        `持股成本 ${formatMoney(holding.cost)}，`

        +

        `平均成本約 ${formatMoneyDecimal(averageCost)} / 股。`;

}


// ==========================
// 持股 UI
// ==========================

function renderHoldings(
    analysis
) {

    const entries =
        Object.entries(
            analysis.holdings
        )

        .filter(
            function (
                [
                    name,
                    holding
                ]
            ) {

                return (
                    holding.shares >
                    0
                    &&
                    holding.cost >
                    0
                );

            }
        )

        .sort(
            function (
                [nameA],
                [nameB]
            ) {

                return nameA.localeCompare(
                    nameB,
                    "zh-Hant"
                );

            }
        );


    holdingCount.textContent =
        `${entries.length} 檔`;


    if (
        entries.length === 0
    ) {

        holdingList.className =
            "empty";

        holdingList.innerHTML =
            "尚無持股";

        return;

    }


    holdingList.className =
        "holding-list";


    holdingList.innerHTML =
        entries

        .map(
            function (
                [
                    name,
                    holding
                ]
            ) {

                const averageCost =
                    holding.cost /
                    holding.shares;


                return `

                    <div class="holding-item">

                        <div>

                            <strong class="holding-name">
                                ${escapeHtml(name)}
                            </strong>

                            <div class="holding-meta">
                                ${holding.shares.toLocaleString("zh-TW")} 股
                                · 平均成本 ${formatMoneyDecimal(averageCost)}
                            </div>

                        </div>


                        <div class="holding-cost">

                            <span>
                                持股成本
                            </span>

                            <strong>
                                ${formatMoney(holding.cost)}
                            </strong>

                        </div>

                    </div>

                `;

            }
        )

        .join("");

}


// ==========================
// 最近紀錄
// ==========================

function renderRecords(
    analysis
) {

    recordCount.textContent =
        `${transactions.length} 筆`;


    if (
        transactions.length ===
        0
    ) {

        recordList.className =
            "empty";

        recordList.innerHTML =
            "尚無紀錄";

        return;

    }


    const reversed =
        [
            ...transactions
        ]

        .sort(
            function (
                a,
                b
            ) {

                const dateCompare =
                    String(
                        b.date
                    )
                    .localeCompare(
                        String(
                            a.date
                        )
                    );


                if (
                    dateCompare !== 0
                ) {

                    return dateCompare;

                }


                return (
                    Number(
                        b.id
                    )
                    -
                    Number(
                        a.id
                    )
                );

            }
        );


    recordList.className =
        "record-list";


    recordList.innerHTML =
        reversed

        .map(
            function (
                transaction
            ) {

                let typeName =
                    "";

                let detail =
                    "";

                let rightText =
                    "";

                let rightClass =
                    "neutral";


                if (
                    transaction.type ===
                    "deposit"
                ) {

                    typeName =
                        "入金";

                    rightText =
                        formatMoney(
                            transaction.amount
                        );

                }


                else if (
                    transaction.type ===
                    "withdraw"
                ) {

                    typeName =
                        "出金";

                    rightText =
                        formatMoney(
                            transaction.amount
                        );

                }


                else if (
                    transaction.type ===
                    "buy"
                ) {

                    typeName =
                        "買入股票";


                    detail =

                        ` · ${escapeHtml(
                            transaction.stockName
                        )}`

                        +

                        ` · ${Number(
                            transaction.shares
                        ).toLocaleString("zh-TW")} 股`;


                    rightText =
                        formatMoney(
                            transaction.amount
                        );

                }


                else if (
                    transaction.type ===
                    "sell"
                ) {

                    typeName =
                        "賣出股票";


                    const derived =
                        analysis
                        .derived[
                            String(
                                transaction.id
                            )
                        ];


                    const pnl =
                        Number(
                            transaction.pnl
                        ) || 0;


                    if (
                        pnl > 0
                    ) {

                        rightClass =
                            "positive";

                    }

                    else if (
                        pnl < 0
                    ) {

                        rightClass =
                            "negative";

                    }


                    if (
                        derived
                    ) {

                        detail =

                            ` · ${escapeHtml(
                                transaction.stockName
                            )}`

                            +

                            ` · ${derived.sellShares.toLocaleString("zh-TW")} 股`

                            +

                            ` · 成本 ${formatMoney(
                                derived.soldCost
                            )}`

                            +

                            ` · 賣回 ${formatMoney(
                                derived.proceeds
                            )}`;

                    }


                    rightText =
                        formatSignedMoney(
                            pnl
                        );

                }


                const noteText =
                    transaction.note

                        ? ` · ${escapeHtml(
                            transaction.note
                        )}`

                        : "";


                return `

                    <div class="record-item">

                        <div class="record-info">

                            <strong>
                                ${typeName}
                            </strong>

                            <p>
                                ${escapeHtml(
                                    transaction.date
                                )}
                                ${detail}
                                ${noteText}
                            </p>

                        </div>


                        <div class="record-right">

                            <strong
                                class="${rightClass}"
                            >
                                ${rightText}
                            </strong>


                            <div class="record-actions">

                                <button
                                    type="button"
                                    class="edit-button"
                                    data-id="${transaction.id}"
                                >
                                    編輯
                                </button>

                                <button
                                    type="button"
                                    class="delete-button"
                                    data-id="${transaction.id}"
                                >
                                    刪除
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }
        )

        .join("");

}


// ==========================
// 更新首頁
// ==========================

function updateUI() {

    const analysis =
        analyzeTransactions(
            transactions
        );


    if (
        !analysis.ok
    ) {

        console.error(
            analysis.message
        );

        return;

    }


    totalAssets.textContent =
        formatMoney(
            analysis.currentAssets
        );


    totalDeposit.textContent =
        formatMoney(
            analysis.deposits
        );


    totalWithdraw.textContent =
        formatMoney(
            analysis.withdrawals
        );


    netDeposit.textContent =
        formatMoney(
            analysis.netContribution
        );


    cash.textContent =
        formatMoney(
            analysis.currentCash
        );


    stockValue.textContent =
        formatMoney(
            analysis.currentStockCost
        );


    profit.textContent =
        formatSignedMoney(
            analysis.totalProfit
        );


    returnRate.textContent =

        (
            analysis.returnRate >
            0

                ? "+"

                : ""
        )

        +

        analysis.returnRate
            .toFixed(
                2
            )

        +

        "%";


    setProfitClass(
        profit,
        analysis.totalProfit
    );


    setProfitClass(
        returnRate,
        analysis.returnRate
    );


    renderHoldings(
        analysis
    );


    renderRecords(
        analysis
    );


    renderStockSuggestions();


    updateSellSharesHint();

}


// ==========================
// 刪除
// ==========================

function deleteTransaction(
    id
) {

    const candidate =
        transactions.filter(
            function (
                item
            ) {

                return (
                    Number(
                        item.id
                    )
                    !==
                    Number(
                        id
                    )
                );

            }
        );


    const analysis =
        analyzeTransactions(
            candidate
        );


    if (
        !analysis.ok
    ) {

        alert(

            "這筆紀錄目前不能刪除，因為刪除後會讓其他紀錄不合理。\n\n"

            +

            analysis.message

        );


        return;

    }


    const confirmed =
        confirm(
            "確定要刪除這筆紀錄嗎？"
        );


    if (
        !confirmed
    ) {

        return;

    }


    transactions =
        candidate;


    saveTransactions();


    updateUI();


    showToast(
        "已刪除紀錄"
    );

}


// ==========================
// JSON 備份
// ==========================

function downloadTextFile(
    filename,
    text,
    type
) {

    const blob =
        new Blob(
            [text],
            {
                type:
                    type
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


function exportBackup() {

    const data = {

        app:
            "Capital Tracker",

        version:
            4,

        exportedAt:
            new Date()
                .toISOString(),

        transactions:
            transactions

    };


    downloadTextFile(

        `capital-tracker-backup-${getTodayString()}.json`,

        JSON.stringify(
            data,
            null,
            2
        ),

        "application/json;charset=utf-8"

    );


    showToast(
        "已建立 JSON 備份"
    );

}


// ==========================
// CSV
// ==========================

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    return (

        '"' +

        text.replaceAll(
            '"',
            '""'
        )

        +

        '"'

    );

}


function exportCsv() {

    const analysis =
        analyzeTransactions(
            transactions
        );


    const header = [

        "日期",

        "類型",

        "股票名稱",

        "股數",

        "金額",

        "股票損益",

        "賣出成本",

        "賣回現金",

        "備註"

    ];


    const rows =
        transactions.map(
            function (
                transaction
            ) {

                const typeNames = {

                    deposit:
                        "入金",

                    withdraw:
                        "出金",

                    buy:
                        "買入股票",

                    sell:
                        "賣出股票"

                };


                const derived =
                    analysis
                    .derived[
                        String(
                            transaction.id
                        )
                    ];


                return [

                    transaction.date,

                    typeNames[
                        transaction.type
                    ],

                    transaction.stockName ||
                    "",

                    transaction.shares ||
                    "",

                    transaction.type ===
                    "sell"

                        ? ""

                        : transaction.amount,

                    transaction.type ===
                    "sell"

                        ? transaction.pnl

                        : "",

                    derived

                        ? derived.soldCost

                        : "",

                    derived

                        ? derived.proceeds

                        : "",

                    transaction.note ||
                    ""

                ];

            }
        );


    const csv =

        "\uFEFF"

        +

        [
            header,
            ...rows
        ]

        .map(
            function (
                row
            ) {

                return row

                    .map(
                        csvEscape
                    )

                    .join(
                        ","
                    );

            }
        )

        .join(
            "\r\n"
        );


    downloadTextFile(

        `capital-tracker-${getTodayString()}.csv`,

        csv,

        "text/csv;charset=utf-8"

    );


    showToast(
        "已匯出 CSV"
    );

}


// ==========================
// 匯入
// ==========================

function importBackupFile(
    file
) {

    const reader =
        new FileReader();


    reader.addEventListener(
        "load",
        function () {

            try {

                const parsed =
                    JSON.parse(
                        reader.result
                    );


                const imported =
                    Array.isArray(
                        parsed
                    )

                        ? parsed

                        : parsed.transactions;


                if (
                    !Array.isArray(
                        imported
                    )
                ) {

                    throw new Error(
                        "格式錯誤"
                    );

                }


                const analysis =
                    analyzeTransactions(
                        imported
                    );


                if (
                    !analysis.ok
                ) {

                    alert(

                        "無法匯入：\n\n"

                        +

                        analysis.message

                    );


                    return;

                }


                const confirmed =
                    confirm(

                        `備份共有 ${imported.length} 筆紀錄。\n\n匯入後會取代目前資料，確定嗎？`

                    );


                if (
                    !confirmed
                ) {

                    return;

                }


                transactions =
                    imported;


                saveTransactions();


                updateUI();


                closeManageModal();


                showToast(
                    "備份匯入成功"
                );

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "這不是有效的 Capital Tracker v4 JSON 備份。"
                );

            }


            finally {

                importFile.value =
                    "";

            }

        }
    );


    reader.readAsText(
        file
    );

}


// ==========================
// 清空
// ==========================

function resetAllData() {

    const first =
        confirm(

            "確定要清空所有資料嗎？\n\n建議先下載 JSON 備份。"

        );


    if (
        !first
    ) {

        return;

    }


    const second =
        confirm(
            "最後確認：真的要刪除全部紀錄嗎？"
        );


    if (
        !second
    ) {

        return;

    }


    transactions =
        [];


    localStorage.removeItem(
        STORAGE_KEY
    );


    updateUI();


    closeManageModal();


    showToast(
        "所有資料已清空"
    );

}


// ==========================
// 管理 Modal
// ==========================

function closeManageModal() {

    manageModal.classList.remove(
        "show"
    );

}


// ==========================
// Events
// ==========================

typeInput.addEventListener(
    "change",
    function () {

        clearFormError();


        updateFormFields();

    }
);


stockNameInput.addEventListener(
    "input",
    updateSellSharesHint
);


profitButton.addEventListener(
    "click",
    function () {

        setPnlType(
            "profit"
        );

    }
);


lossButton.addEventListener(
    "click",
    function () {

        setPnlType(
            "loss"
        );

    }
);


addButton.addEventListener(
    "click",
    openAddModal
);


closeButton.addEventListener(
    "click",
    closeTransactionModal
);


cancelButton.addEventListener(
    "click",
    closeTransactionModal
);


modal.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target ===
            modal
        ) {

            closeTransactionModal();

        }

    }
);


transactionForm.addEventListener(
    "submit",
    function (
        event
    ) {

        event.preventDefault();


        saveFormTransaction();

    }
);


// 編輯 / 刪除

recordList.addEventListener(
    "click",
    function (
        event
    ) {

        const editButton =
            event.target.closest(
                ".edit-button"
            );


        const deleteButton =
            event.target.closest(
                ".delete-button"
            );


        if (
            editButton
        ) {

            const id =
                Number(
                    editButton
                        .dataset
                        .id
                );


            const transaction =
                transactions.find(
                    function (
                        item
                    ) {

                        return (
                            Number(
                                item.id
                            )
                            ===
                            id
                        );

                    }
                );


            if (
                transaction
            ) {

                openEditModal(
                    transaction
                );

            }


            return;

        }


        if (
            deleteButton
        ) {

            deleteTransaction(

                Number(
                    deleteButton
                        .dataset
                        .id
                )

            );

        }

    }
);


// 資料管理

manageButton.addEventListener(
    "click",
    function () {

        manageModal.classList.add(
            "show"
        );

    }
);


closeManageButton.addEventListener(
    "click",
    closeManageModal
);


manageModal.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target ===
            manageModal
        ) {

            closeManageModal();

        }

    }
);


backupButton.addEventListener(
    "click",
    exportBackup
);


csvButton.addEventListener(
    "click",
    exportCsv
);


importButton.addEventListener(
    "click",
    function () {

        importFile.click();

    }
);


importFile.addEventListener(
    "change",
    function () {

        const file =
            importFile.files[
                0
            ];


        if (
            file
        ) {

            importBackupFile(
                file
            );

        }

    }
);


resetButton.addEventListener(
    "click",
    resetAllData
);


// ==========================
// PWA
// ==========================

if (
    "serviceWorker"
    in
    navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator
                .serviceWorker
                .register(
                    "./sw.js"
                )

                .catch(
                    function (
                        error
                    ) {

                        console.error(
                            "Service Worker 註冊失敗",
                            error
                        );

                    }
                );

        }
    );

}


// ==========================
// 啟動
// ==========================

setToday();

setPnlType(
    "profit"
);

updateFormFields();

updateUI();
