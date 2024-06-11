
exports.walletDescription = function (tType, dedected) {
    var transType = "";
    var desc = "";
    switch (tType) {
        case "addMoney":
            transType = "Add Money";
            desc = "Add money to " + dedected + " account";
            break;
        case "reversal":
            transType = "Reversal";
            desc = "Amount reversed from " + dedected + " account";
            break;
        case "buy":
            transType = "Buy";
            desc = "Amount debited from " + dedected + "";
            break;
        case "buyCash":
            transType = "Buy";
            desc = "Amount debited from " + dedected + "";
            break;
        case "transfer":
            transType = "Transfer";
            desc = "Amount debited from " + dedected + "";
            break;
        case "walletToBank":
            transType = "Wallet To Bank";
            desc = "Wallet amount transferred to bank account";
            break;
        case "revenue":
            transType = "Revenue";
            desc = "Revenue credited to wallet";
            break;
        case "tds":
            transType = "TDS";
            desc = "TDS debited from wallet";
            break;
        case "redeemCash":
            transType = "Sell";
            desc = "Amount credited to " + dedected + "";
            break;
        default:
            transType = tType;
            desc = "";
    }
    return {
        transType,
        desc
    }
}