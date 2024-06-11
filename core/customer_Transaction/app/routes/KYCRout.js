'use strict';
module.exports = function (app) {
  const { getChargesfromDB, validatelimits, validatelimitsaddmoney } = require('../validations/validations'),
    kyccontroller = require('../controllers/KYCController'),
    list_charges_controller = require('../controllers/list.charges.controller'),
    bank_controller = require('../controllers/bank.controller'),
    b2cnewcontroller = require('../controllers/b2cNewController');

  app.route('/api/qrstatus').post(kyccontroller.qr_status_update);
  app.route('/api/qrreadstatus').post(kyccontroller.qr_read_status);
  app.route('/api/qrreadremmitupdate').post(kyccontroller.qr_read_remmit_update);
  app.route('/api/qrreadremmit').post(kyccontroller.qr_read_remmit);
  app.route('/api/printinvoiceaddmoney').post(kyccontroller.print_invoice_add_money);
  app.route('/api/recenttransfers').post(getChargesfromDB, kyccontroller.recent_transfers); 
  app.route('/api/atomaddmoney').post(getChargesfromDB, kyccontroller.atom_Add_money);
  app.route('/api/addmoney').post(kyccontroller.Add_money);
  app.route('/api/validatestock').post(kyccontroller.validate_stock);
  app.route('/api/validatestocktrans').post(kyccontroller.validate_stock_trans);
  app.route('/api/insatomlog').post(getChargesfromDB, validatelimitsaddmoney, kyccontroller.ins_atom_log);
  app.route('/api/addmoneylogreport').post(getChargesfromDB, kyccontroller.add_money_log_report);
  app.route('/api/printinvoiceviacrnno').post(getChargesfromDB, kyccontroller.print_invoice_by_crrno);  //list.charges.controller
  app.route('/api/listcharges').post(getChargesfromDB, list_charges_controller.list_charges);
  app.route('/api/listchargesinternaluse').post(getChargesfromDB, list_charges_controller.list_charges_internal_use);
  app.route('/api/profitlossbuysell').post(b2cnewcontroller.profitlossbuysell);
  app.route('/api/ins_bankacc_logs').post(bank_controller.ins_Virtual_Account_log);
  app.route('/api/find_consumer_bankacc').post(bank_controller.find_consumer_bankacc);
  app.route('/api/ins_bank_trans_log').post(bank_controller.ins_bank_trans_log);
  app.route('/api/redeemStockReverse').post(getChargesfromDB, kyccontroller.redeemcash_stock_Reverse);
  app.route('/api/addmoneytobank').post(getChargesfromDB, validatelimits, kyccontroller.addmoney_to_bank);
  app.route('/api/addmoneytobankwithAcc').post(getChargesfromDB, validatelimits, kyccontroller.addmoney_to_bank_withAccno);
  app.route('/api/reverseWalletBal').post(getChargesfromDB, kyccontroller.reverse_Wallet_Bal);
  app.route('/api/listallchargesconsumer').post(getChargesfromDB, kyccontroller.list_all_charges_consumer);
  app.route('/api/profitlossbuysellOld').post(getChargesfromDB, kyccontroller.profitlossbuysellOld);
  app.route('/api/validatelimitsOnOTP').post(kyccontroller.validatelimitsOnOTP);
}