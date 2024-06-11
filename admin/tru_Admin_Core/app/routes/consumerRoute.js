'use strict';

var controller = require('../controllers/consumerController');
var summaryRoute = require('../controllers/consumerSummary');
var request = require('request');
var conf = require('../config');
module.exports = function (app) {
  app.route('/api')
    .get(controller.test);

  app.route('/api/custupkycflagadmin')
    .post(controller.cust_up_kyc_flag_admin);

  app.route('/api/consumerlistadmin')
    .post(controller.consumer_list_admin);

  app.route('/api/listAddress')
    .post(controller.list_address);

  app.route('/api/consumerlistprofileadmin')
    .post(controller.list_customer_profile_for_admin);

  app.route('/api/referenceregistrationadmin')
    .post(controller.ins_reference_registration_admin);

  app.route('/api/consumeraddressdetails')
    .post(controller.Update_address);

  app.route('/api/updatecustregadmin')
    .post(controller.update_cust_reg_admin);

  app.route('/api/consumeraddkycdocs')
    .post(controller.add_kyc_docs);


  app.route('/api/consumerupdatekycdocsfromentity')
    .post(controller.Update_KYCDocs_from_entity);

  app.route('/api/countallconsumer')
    .post(controller.count_all_consumer);

  app.route('/api/allconsumerreportadmin')
    .post(controller.all_consumer_report_admin);

  app.route('/api/consumerupdatekycflagadmin')
    .post(controller.consumer_update_kyc_flag_admin);

  app.route('/api/assetmanagertxnreportadmin')
    .post(getChargesfromDB, controller.assetmanager_txn_report_admin);

  app.route('/api/customertoassetmanageralltxnprofitreportdatewise')
    .post(controller.customer_to_assetmanager_all_txn_profit_report_datewise);

  app.route('/api/printinvoiceadmin')
    .post(getChargesfromDB, controller.print_invoice_admin);

  app.route('/api/printinvoicec2cadmin')
    .post(getChargesfromDB, controller.print_invoice_c2c_admin);

  app.route('/api/consumeraddmoneylogreport')
    .post(getChargesfromDB, controller.add_money_log_report);

  app.route('/api/entityprofitreport')
    .post(controller.entity_profit_report);

  app.route('/api/entitytxnreportadmin')
    .post(getChargesfromDB, controller.entity_txn_report_admin);

  app.route('/api/buystocktrend')
    .post(controller.buy_stock_trend);

  app.route('/api/redeemstocktrend')
    .post(controller.redeem_stock_trend);


  app.route('/api/entitynetworktxnreportadmin')
    .post(getChargesfromDB, controller.entity_network_txn_report_admin);


  app.route('/api/insatomlogRefund').post(controller.insatomlog_Refund);

  app.route('/api/bankLoglogreportadmin')
    .post(getChargesfromDB, controller.bankLog_log_report_admin);

  app.route('/api/consumergstreportadmin')
    .post(controller.consumer_gst_report_admin);

  app.route('/api/allwalletlogreport')
    .post(getChargesfromDB, controller.all_wallet_log_report);

  app.route('/api/atomlogreportadmin')
    .post(getChargesfromDB, controller.atom_log_report_admin);


  app.route('/api/consumerpartnerrevenue')
    .post(controller.consumer_partner_revenue);

  app.route('/api/UpdateKYCDocsfromadmin')
    .post(controller.Update_KYCDocs_from_admin);

  app.route('/api/custInvoicePreview')
    .post(controller.cust_Invoice_Preview);

  app.route('/api/consumerpartnerpayouts')
    .post(controller.consumer_partner_payouts);
  app.route('/api/consumerpartnerpayout')
    .post(controller.consumer_partner_payouts);

  app.route('/api/consumerPermission')
    .post(controller.consumer_Permission);

  app.route('/api/consumertxnupdatelimit')
    .post(controller.consumer_updatelimit);

  app.route('/api/consumerhomeupdatelimit')
    .post(controller.home_updatelimit);

  app.route('/api/consumerWalletupdateLimit')
    .post(controller.consumer_updateWalletLimit);

  app.route('/api/entityalltxnreport')
    .post(controller.entity_all_txn_report);

  app.route('/api/entityalltxnreportdatewise')
    .post(controller.entity_all_txn_report_datewise);

  app.route('/api/reverseCustTxn')
    .post(controller.reverse_Cust_Txn);

  app.route('/api/entityrevenuetxnwisereport')
    .post(getChargesfromDB, controller.entity_revenue_TXN_Wise_report);

  app.route('/api/parententitydetailedreportadmin')
    .post(controller.parent_entity_detailed_report_admin);

  app.route('/api/getConsumerNodeStock')
    .post(controller.getConsumer_Node_Stock);

  app.route('/api/entityalltxnreportOpti')
    .post(controller.entity_all_txn_reportOpti);

  app.route('/api/wallet_consumerPreview')
    .post(controller.wallet_consumerPreview);
}


function getChargesfromDB(req, res, next) {
  request.post({
    "headers": { "content-type": "application/json" },
    "url": conf.adminReqIP + ":5112/api/getAllCharges",
  }, (error, response, body) => {
    if (error) {
      console.log(error)
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
};

function validatelimitsaddmoney(req, res, next) {
  var truID = req.body.totruid ? req.body.totruid : req.body.truid;
  var amt = req.body.totalamount ? parseFloat(req.body.totalamount) : 0;
  KycAll.find({ $or: [{ truID: truID }, { CRNNo: req.body.crnno }] }, function (err, docs) {
    if (docs && docs.length > 0) {
      var kycFlag = docs[0].docVerified == true ? "KYC" : "nonKYC";
      request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.reqip + ":4125/api/showconsumerconfigurations",
        "body": JSON.stringify({ "kycflag": kycFlag, "appliedOn": "consumer" })
      }, (error, response, body) => {
        if (error) {
          res.json({ status: "500", message: "Internal Server Error" })
        }
        else {
          if (response.statusCode == 200) {
            if (JSON.parse(body).status == "200") {
              var limit = JSON.parse(body).resource.limit.walletLimit;
              ConsumerConfig.checkaddtoWalletLimit(truID, amt, function (limitcb) {
                if (limitcb === "200") {
                  next();
                }
                else if (limitcb === "500") {
                  res.json({ status: "204", message: "You have exceeded your transaction limit! Please verify your KYC for unlimited access." });
                } else {
                  res.json({ status: "204", message: "Something went wrong, Please try again!" });
                }
              })
            } else {
              res.json(JSON.parse(body))
            }
          } else {
            res.json({ status: "204", message: "something went wrong" })
          }
        }
      })
    } else {
      res.json({ status: "204", message: "something went wrong" })
    }
  })
}