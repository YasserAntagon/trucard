'use strict';
const authController = require("../controllers/authController");
const stockController = require("../controllers/stockController");
const transController = require("../controllers/transactionController");
module.exports = function (app) {
    app.route('/api/minregistration').post(authController.min_registration);
    app.route('/api/updatekycdocsfromentityindividual').post(authController.Update_KYCDocs_from_entity_Individual);
    app.route('/api/updatekycfromentity').post(authController.Update_KYC_from_entity);
    app.route('/api/updatetransactionpin').post(authController.update_transaction_pin);
    app.route('/api/verifytransactionpin').post(authController.verify_transaction_pin);
    app.route('/api/changepassword').post(authController.change_password);
    app.route('/api/profile').post(authController.list_profile);
    app.route('/api/entityvalidation').post(authController.entity_validation);
    app.route('/api/entityDetailsFromMobile').post(authController.entity_Details_From_Mobile);
    app.route('/api/showaddressinvoice').post(authController.show_address_for_invoice);
    app.route('/api/topassetmanager').post(getChargesfromDB, authController.top_assetmanager);
    app.route('/api/entityRevenuechargesHistory').post(stockController.entity_Revenue_charges_History);
    app.route('/api/updateClientStock').post(stockController.update_Client_Stock);
    app.route('/api/entitywalletupdatetxn').post(transController.entity_wallet_update_txn);
    app.route('/api/entityrevenuerefund').post(transController.entity_Revenue_refund);
    app.route('/api/clientlistprofile').post(authController.client_list_profile);
    app.route('/api/checkClientExistOrNot').post(authController.check_Client_ExistOrNOt);
    app.route('/api/checkClientcharges').post(authController.check_Client_charges);
    app.route('/api/checkpartnerWalletTxn').post(transController.checkpartner_Wallet_Txn);
    app.route('/api/clientChargesBetweenDate').post(authController.client_Charges_BetweenDate);
    app.route('/api/clientWalletHistory').post(transController.client_Wallet_History);

}

function getChargesfromDB(req, res, next) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminReqIP + ":5112/api/getAllCharges",
    }, (error, response, body) => {
        if (error) {
            res.json({ status: "500", message: "Internal Server Error" })
        }
        else {
            if (response.statusCode == 200) {
                var resp = JSON.parse(body);
                req.generalCharges = resp.charges;
                next();
            } else {
                res.json({ status: "204", message: "something went wrong" })
            }
        }
    });
}
