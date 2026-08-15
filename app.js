console.log("Capital Tracker 啟動成功");


// ==========================
// HTML 元素
// ==========================

const totalAssets =
    document.getElementById("totalAssets");

const profit =
    document.getElementById("profit");

const returnRate =
    document.getElementById("returnRate");

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


const addButton =
    document.getElementById("addButton");

const manageButton =
    document.getElementById("manageButton");


const modal =
    document.getElementById("modal");

const modalTitle =
    document.getElementById("modalTitle");

const closeButton =
    document.getElementById("closeButton");

const cancelButton =
    document.getElementById("cancelButton");

const transactionForm =
    document.getElementById("transactionForm");

const formError =
    document.getElementById("formError");


const typeInput =
    document.getElementById("type");

const amountInput =
    document.getElementById("amount");

const amountLabel =
    document.getElementById("amountLabel");

const dateInput =
    document.getElementById("date");

const noteInput =
    document.getElementById("note");

const stockNameField =
    document.getElementById("stockNameField");

const stockNameInput =
    document.getElementById("stockName");

const stockSuggestions =
    document.getElementById("stockSuggestions");

const sellCostField =
    document.getElementById("sellCostField");

const sellCostInput =
    document.getElementById("sellCost");


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
// 資料
// ==========================

const STORAGE_KEY =
    "capital_tracker_transactions_v2";

const OLD_STORAGE_KEY =
    "transactions";


let transactions =
    loadTransactions();


let editingId = null;


// ==========================
// 舊版資料自動搬移
// ==========================

function loadTransactions() {

    const current =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (current !== null) {

        try {

            const parsed =
                JSON.parse(current);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(error);

            return [];

        }

    }


    const old =
        localStorage.getItem(
            OLD_STORAGE_KEY
        );


    if (old !== null) {

        try {

            const parsed =
                JSON.parse(old);


            if (Array.isArray(parsed)) {

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(parsed)
                );

                return parsed;

            }

        } catch (error) {

            console.error(error);

        }

    }


    return [];

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
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function setToday() {

    dateInput.value =
        getTodayString();

}


// ==========================
// 共用工具
// ==========================

function formatMoney(number) {

    const safeNumber =
        Number(number) || 0;


    const sign =
        safeNumber < 0
            ? "-"
            : "";


    return (
        sign +
        "NT$ " +
        Math.abs(
            Math.round(safeNumber)
        ).toLocaleString("zh-TW")
    );

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    window.clearTimeout(
        showToast.timer
    );


    showToast.timer =
        window.setTimeout(
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
    number
) {

    element.classList.remove(
        "positive",
        "negative",
        "neutral"
    );


    if (number > 0) {

        element.classList.add(
            "positive"
        );

    } else if (number < 0) {

        element.classList.add(
            "negative"
        );

    } else {

        element.classList.add(
            "neutral"
        );

    }

}


function saveTransactions() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(transactions)
    );

}


function normalizeStockName(name) {

    return String(name || "")
        .trim();

}


// ==========================
// 表單顯示
// ==========================

function updateFormFields() {

    const type =
        typeInput.value;


    stockNameField.style.display =
        "none";

    sellCostField.style.display =
        "none";


    amountLabel.textContent =
        "金額";

    amountInput.placeholder =
        "例如：50000";


    if (type === "buy") {

        stockNameField.style.display =
            "block";

        amountLabel.textContent =
            "花費金額";

        amountInput.placeholder =
            "例如：15000";

    }


    if (type === "sell") {

        stockNameField.style.display =
            "block";

        sellCostField.style.display =
            "block";

        amountLabel.textContent =
            "賣出收到金額";

        amountInput.placeholder =
            "例如：20000";

    }

}


function clearFormError() {

    formError.hidden =
        true;

    formError.textContent =
        "";

}


function showFormError(message) {

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

    clearFormError();

    updateFormFields();

    modal.classList.add(
        "show"
    );

}


function openEditModal(transaction) {

    editingId =
        Number(
            transaction.id
        );

    modalTitle.textContent =
        "編輯紀錄";

    typeInput.value =
        transaction.type;

    amountInput.value =
        transaction.amount;

    dateInput.value =
        transaction.date;

    noteInput.value =
        transaction.note || "";

    stockNameInput.value =
        transaction.stockName || "";

    sellCostInput.value =
        transaction.type === "sell"
            ? transaction.cost || ""
            : "";


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


function closeManageModal() {

    manageModal.classList.remove(
        "show"
    );

}


// ==========================
// 交易排序
// ==========================

function sortTransactionsForValidation(
    items
) {

    return [...items]
        .sort(
            function (a, b) {

                const dateCompare =
                    String(a.date)
                        .localeCompare(
                            String(b.date)
                        );


                if (dateCompare !== 0) {

                    return dateCompare;

                }


                return (
                    Number(a.id) -
                    Number(b.id)
                );

            }
        );

}


// ==========================
// 全資料防呆
//
// 規則：
// 1. 出金不能讓現金 < 0
// 2. 買入不能讓現金 < 0
// 3. 賣出成本不能超過該股票當下持股成本
// ==========================

function validateTransactionSet(
    items
) {

    let currentCash = 0;

    const holdings = {};


    const ordered =
        sortTransactionsForValidation(
            items
        );


    for (
        const transaction
        of ordered
    ) {

        const amount =
            Number(
                transaction.amount
            );


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return {
                ok: false,
                message:
                    `${transaction.date} 有一筆金額不正確。`
            };

        }


        if (
            transaction.type ===
            "deposit"
        ) {

            currentCash +=
                amount;

            continue;

        }


        if (
            transaction.type ===
            "withdraw"
        ) {

            if (
                amount >
                currentCash
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 的出金 ${formatMoney(amount)} 超過當時可用現金 ${formatMoney(currentCash)}。`
                };

            }


            currentCash -=
                amount;

            continue;

        }


        if (
            transaction.type ===
            "buy"
        ) {

            const stockName =
                normalizeStockName(
                    transaction.stockName
                );


            if (stockName === "") {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆買入沒有股票名稱。`
                };

            }


            if (
                amount >
                currentCash
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 買入 ${stockName} 的 ${formatMoney(amount)} 超過當時可用現金 ${formatMoney(currentCash)}。`
                };

            }


            currentCash -=
                amount;


            if (!holdings[stockName]) {

                holdings[stockName] = 0;

            }


            holdings[stockName] +=
                amount;

            continue;

        }


        if (
            transaction.type ===
            "sell"
        ) {

            const stockName =
                normalizeStockName(
                    transaction.stockName
                );

            const cost =
                Number(
                    transaction.cost
                );


            if (stockName === "") {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 有一筆賣出沒有股票名稱。`
                };

            }


            if (
                !Number.isFinite(cost) ||
                cost <= 0
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 賣出 ${stockName} 的原始成本不正確。`
                };

            }


            const holdingCost =
                holdings[stockName] || 0;


            if (
                cost >
                holdingCost
            ) {

                return {
                    ok: false,
                    message:
                        `${transaction.date} 賣出 ${stockName} 的成本 ${formatMoney(cost)} 超過當時持股成本 ${formatMoney(holdingCost)}。`
                };

            }


            holdings[stockName] =
                holdingCost -
                cost;


            currentCash +=
                amount;

            continue;

        }


        return {
            ok: false,
            message:
                `發現無法辨識的紀錄類型：${transaction.type}`
        };

    }


    return {
        ok: true
    };

}


// ==========================
// 建立表單交易
// ==========================

function buildTransactionFromForm() {

    clearFormError();


    const type =
        typeInput.value;

    const amount =
        Number(
            amountInput.value
        );

    const date =
        dateInput.value;


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showFormError(
            "請輸入大於 0 的正確金額。"
        );

        return null;

    }


    if (!date) {

        showFormError(
            "請選擇日期。"
        );

        return null;

    }


    const transaction = {

        id:
            editingId === null
                ? Date.now()
                : editingId,

        type:
            type,

        amount:
            amount,

        stockName:
            "",

        date:
            date,

        note:
            noteInput.value.trim()

    };


    if (
        type === "buy" ||
        type === "sell"
    ) {

        const stockName =
            normalizeStockName(
                stockNameInput.value
            );


        if (stockName === "") {

            showFormError(
                "請輸入股票名稱。"
            );

            return null;

        }


        transaction.stockName =
            stockName;

    }


    if (type === "sell") {

        const cost =
            Number(
                sellCostInput.value
            );


        if (
            !Number.isFinite(cost) ||
            cost <= 0
        ) {

            showFormError(
                "請輸入大於 0 的賣出原始成本。"
            );

            return null;

        }


        transaction.cost =
            cost;

    }


    return transaction;

}


// ==========================
// 嘗試新增 / 編輯
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


    if (editingId === null) {

        candidate =
            [
                ...transactions,
                transaction
            ];

    } else {

        candidate =
            transactions.map(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(editingId)
                    )
                        ? transaction
                        : item;

                }
            );

    }


    const validation =
        validateTransactionSet(
            candidate
        );


    if (!validation.ok) {

        showFormError(
            validation.message
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
// 摘要
// ==========================

function calculateSummary() {

    let deposits = 0;

    let withdrawals = 0;

    let buyCost = 0;

    let sellIncome = 0;

    let soldCost = 0;


    transactions.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "deposit"
            ) {

                deposits +=
                    amount;

            }


            if (
                transaction.type ===
                "withdraw"
            ) {

                withdrawals +=
                    amount;

            }


            if (
                transaction.type ===
                "buy"
            ) {

                buyCost +=
                    amount;

            }


            if (
                transaction.type ===
                "sell"
            ) {

                sellIncome +=
                    amount;

                soldCost +=
                    Number(
                        transaction.cost
                    ) || 0;

            }

        }
    );


    const netDeposits =
        deposits -
        withdrawals;


    const currentCash =
        netDeposits
        - buyCost
        + sellIncome;


    const currentStockCost =
        buyCost -
        soldCost;


    const currentTotalAssets =
        currentCash +
        currentStockCost;


    const totalProfit =
        currentTotalAssets -
        netDeposits;


    const rate =
        netDeposits > 0
            ? (
                totalProfit /
                netDeposits
            ) * 100
            : 0;


    return {

        netDeposits,

        currentCash,

        currentStockCost,

        currentTotalAssets,

        totalProfit,

        rate

    };

}


// ==========================
// 持股
// ==========================

function calculateHoldings() {

    const holdings = {};


    transactions.forEach(
        function (transaction) {

            const stockName =
                normalizeStockName(
                    transaction.stockName
                );


            if (!stockName) {

                return;

            }


            if (!holdings[stockName]) {

                holdings[stockName] = 0;

            }


            if (
                transaction.type ===
                "buy"
            ) {

                holdings[stockName] +=
                    Number(
                        transaction.amount
                    ) || 0;

            }


            if (
                transaction.type ===
                "sell"
            ) {

                holdings[stockName] -=
                    Number(
                        transaction.cost
                    ) || 0;

            }

        }
    );


    return holdings;

}


// ==========================
// 股票名稱建議
// ==========================

function renderStockSuggestions() {

    const names =
        Object.keys(
            calculateHoldings()
        )
        .sort(
            function (a, b) {

                return a.localeCompare(
                    b,
                    "zh-Hant"
                );

            }
        );


    stockSuggestions.innerHTML =
        names
            .map(
                function (name) {

                    return (
                        `<option value="${escapeHtml(name)}"></option>`
                    );

                }
            )
            .join("");

}


// ==========================
// 持股 UI
// ==========================

function renderHoldings() {

    const holdings =
        calculateHoldings();


    const entries =
        Object.entries(holdings)
            .filter(
                function (
                    [name, cost]
                ) {

                    return cost > 0;

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
                    [name, cost]
                ) {

                    return `
                        <div class="holding-item">

                            <strong class="holding-name">
                                ${escapeHtml(name)}
                            </strong>

                            <div class="holding-cost">

                                <span>
                                    持股成本
                                </span>

                                <strong>
                                    ${formatMoney(cost)}
                                </strong>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


// ==========================
// 紀錄 UI
// ==========================

function renderRecords() {

    recordCount.textContent =
        `${transactions.length} 筆`;


    if (
        transactions.length === 0
    ) {

        recordList.className =
            "empty";

        recordList.innerHTML =
            "尚無紀錄";

        return;

    }


    const reversed =
        [...transactions]
            .sort(
                function (a, b) {

                    const dateCompare =
                        String(b.date)
                            .localeCompare(
                                String(a.date)
                            );


                    if (
                        dateCompare !== 0
                    ) {

                        return dateCompare;

                    }


                    return (
                        Number(b.id) -
                        Number(a.id)
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

                    let typeName = "";

                    let detail = "";

                    let amountClass =
                        "neutral";


                    if (
                        transaction.type ===
                        "deposit"
                    ) {

                        typeName =
                            "入金";

                    }


                    else if (
                        transaction.type ===
                        "withdraw"
                    ) {

                        typeName =
                            "出金";

                    }


                    else if (
                        transaction.type ===
                        "buy"
                    ) {

                        typeName =
                            "買入股票";

                        detail =
                            ` · ${escapeHtml(transaction.stockName)}`;

                    }


                    else if (
                        transaction.type ===
                        "sell"
                    ) {

                        typeName =
                            "賣出股票";


                        const realizedProfit =
                            Number(
                                transaction.amount
                            ) -
                            Number(
                                transaction.cost
                            );


                        const profitClass =
                            realizedProfit > 0
                                ? "positive"
                                : realizedProfit < 0
                                    ? "negative"
                                    : "neutral";


                        detail =
                            ` · ${escapeHtml(transaction.stockName)}` +
                            ` · 成本 ${formatMoney(transaction.cost)}` +
                            ` · <span class="${profitClass}">損益 ${formatMoney(realizedProfit)}</span>`;

                    }


                    const noteText =
                        transaction.note
                            ? ` · ${escapeHtml(transaction.note)}`
                            : "";


                    return `
                        <div class="record-item">

                            <div class="record-info">

                                <strong>
                                    ${typeName}
                                </strong>

                                <p>
                                    ${escapeHtml(transaction.date)}
                                    ${detail}
                                    ${noteText}
                                </p>

                            </div>


                            <div class="record-right">

                                <strong class="${amountClass}">
                                    ${formatMoney(transaction.amount)}
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

    const summary =
        calculateSummary();


    totalAssets.textContent =
        formatMoney(
            summary.currentTotalAssets
        );


    netDeposit.textContent =
        formatMoney(
            summary.netDeposits
        );


    cash.textContent =
        formatMoney(
            summary.currentCash
        );


    stockValue.textContent =
        formatMoney(
            summary.currentStockCost
        );


    profit.textContent =
        formatMoney(
            summary.totalProfit
        );


    returnRate.textContent =
        summary.rate
            .toFixed(2)
        + "%";


    setProfitClass(
        profit,
        summary.totalProfit
    );


    setProfitClass(
        returnRate,
        summary.rate
    );


    renderHoldings();

    renderRecords();

    renderStockSuggestions();

}


// ==========================
// 刪除
// ==========================

function deleteTransaction(id) {

    const candidate =
        transactions.filter(
            function (item) {

                return (
                    Number(item.id) !==
                    Number(id)
                );

            }
        );


    const validation =
        validateTransactionSet(
            candidate
        );


    if (!validation.ok) {

        window.alert(
            "這筆紀錄目前不能直接刪除，因為刪除後會讓後續資料不合理。\n\n" +
            validation.message
        );

        return;

    }


    const confirmed =
        window.confirm(
            "確定要刪除這筆紀錄嗎？"
        );


    if (!confirmed) {

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
                type: type
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


    window.setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


function exportBackup() {

    const payload = {

        app:
            "Capital Tracker",

        version:
            2,

        exportedAt:
            new Date()
                .toISOString(),

        transactions:
            transactions

    };


    downloadTextFile(
        `capital-tracker-backup-${getTodayString()}.json`,
        JSON.stringify(
            payload,
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
// CSV 匯出
// ==========================

function csvEscape(value) {

    const text =
        String(value ?? "");


    return (
        '"' +
        text.replaceAll(
            '"',
            '""'
        ) +
        '"'
    );

}


function exportCsv() {

    const header =
        [
            "日期",
            "類型",
            "股票名稱",
            "金額",
            "賣出原始成本",
            "備註"
        ];


    const rows =
        transactions
            .map(
                function (
                    transaction
                ) {

                    const typeMap = {
                        deposit: "入金",
                        withdraw: "出金",
                        buy: "買入股票",
                        sell: "賣出股票"
                    };


                    return [
                        transaction.date,
                        typeMap[
                            transaction.type
                        ] || transaction.type,
                        transaction.stockName || "",
                        transaction.amount,
                        transaction.cost || "",
                        transaction.note || ""
                    ];

                }
            );


    const csv =
        "\uFEFF" +
        [
            header,
            ...rows
        ]
        .map(
            function (row) {

                return row
                    .map(
                        csvEscape
                    )
                    .join(",");

            }
        )
        .join("\r\n");


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
// 匯入 JSON
// ==========================

function importBackupFile(file) {

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
                    Array.isArray(parsed)
                        ? parsed
                        : parsed.transactions;


                if (
                    !Array.isArray(imported)
                ) {

                    throw new Error(
                        "格式錯誤"
                    );

                }


                const validation =
                    validateTransactionSet(
                        imported
                    );


                if (!validation.ok) {

                    window.alert(
                        "無法匯入：\n\n" +
                        validation.message
                    );

                    return;

                }


                const confirmed =
                    window.confirm(
                        `備份內共有 ${imported.length} 筆紀錄。\n\n匯入後會取代目前的 ${transactions.length} 筆紀錄，確定嗎？`
                    );


                if (!confirmed) {

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

            } catch (error) {

                console.error(error);

                window.alert(
                    "這個檔案不是有效的 Capital Tracker JSON 備份。"
                );

            } finally {

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

    const confirmed =
        window.confirm(
            "確定要清空全部資料嗎？\n\n這個動作無法復原，建議先下載 JSON 備份。"
        );


    if (!confirmed) {

        return;

    }


    const confirmedAgain =
        window.confirm(
            "最後確認：真的要刪除所有紀錄嗎？"
        );


    if (!confirmedAgain) {

        return;

    }


    transactions =
        [];


    localStorage.removeItem(
        STORAGE_KEY
    );

    localStorage.removeItem(
        OLD_STORAGE_KEY
    );


    updateUI();

    closeManageModal();

    showToast(
        "資料已全部清空"
    );

}


// ==========================
// 事件
// ==========================

typeInput.addEventListener(
    "change",
    function () {

        clearFormError();

        updateFormFields();

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
    function (event) {

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
    function (event) {

        event.preventDefault();

        saveFormTransaction();

    }
);


recordList.addEventListener(
    "click",
    function (event) {

        const editButton =
            event.target.closest(
                ".edit-button"
            );

        const deleteButton =
            event.target.closest(
                ".delete-button"
            );


        if (editButton) {

            const id =
                Number(
                    editButton.dataset.id
                );


            const transaction =
                transactions.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            id
                        );

                    }
                );


            if (transaction) {

                openEditModal(
                    transaction
                );

            }


            return;

        }


        if (deleteButton) {

            const id =
                Number(
                    deleteButton.dataset.id
                );


            deleteTransaction(
                id
            );

        }

    }
);


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
    function (event) {

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
            importFile.files[0];


        if (file) {

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
// Service Worker
// ==========================

if (
    "serviceWorker" in navigator
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
                    function (error) {

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

updateFormFields();

updateUI();
