'use strict';


const request = require('request');
const conf = require('../config');
const controller = require('../controllers/entityController');
const config_controller = require('../entityConfig/config_limit_controller');
module.exports = function (app) {

    app.route('/api/entityregistrationfromadmin')
        .post(controller.ins_registration_from_admin);

    app.route('/api/listprofileforadmin')
        .post(controller.list_profile_for_admin);

    app.route('/api/updateaddressforadmin')
        .post(controller.update_address_for_admin);

    app.route('/api/addnode')
        .post(controller.add_node);

    app.route('/api/entityupdateregadmin')
        .post(controller.update_reg_for_admin);

    app.route('/api/listentitywithconsumercount')
        .post(controller.list_entity_with_consumer_count);

    app.route('/api/findentity')
        .post(controller.find_entity);
 

    app.route('/api/entityupdatekycdocsfromentity')
        .post(controller.Update_KYCDocs_from_entity);

    app.route('/api/entityupkycflagadmin')
        .post(controller.entity_up_kyc_flag_admin);

    app.route('/api/listadminenititycity')
        .post(controller.list_admin_enitity_city);

    app.route('/api/listallparentadmin')
        .post(controller.list_all_parent_for_admin);

    app.route('/api/countallentity')
        .post(controller.count_all_entity);

    app.route('/api/parententityreport')
        .post(controller.parent_entity_report_admin);

    app.route('/api/showallentityadmin')
        .post(controller.show_all_entity_admin);

    app.route('/api/nodeentityreport')
        .post(controller.node_entity_report_admin);

    app.route('/api/entitywalletlogreport')
        .post(controller.entity_wallet_log_report);
/* 
    app.route('/api/entitytoentitytxnreport')
        .post(controller.entity_to_entity_txn_report);

    app.route('/api/entityalltxnreport')
        .post(controller.entity_all_txn_report); */

    app.route('/api/entityaddmoneylogreport')
        .post(controller.add_money_log_report);


    /* app.route('/api/allentitytoassetmanagertxnreportadmin')
        .post(controller.all_entity_to_assetmanager_txn_report_admin); */

    app.route('/api/bankpartnerreportlog')
        .post(controller.bank_partner_report_log);

    app.route('/api/showwalletbalanceforAdmin')
        .post(controller.show_wallet_balanceadmin);

   /*  app.route('/api/entitygstreportadmin')
        .post(controller.entity_gst_report_adminNEW); */
  

    app.route('/api/updatewalletaccessadmin')  //update wallet limit and flags from admin for a parent and its nodes entity 
        .post(config_controller.wallet_access);

    app.route('/api/updateconsumeraccessadmin')  //update consumer txns access flags from admin for a parent and its nodes entity 
        .post(config_controller.consumer_access);

    app.route('/api/updateentityselfaccessadmin')  //update entity self txns access flags from admin for a parent and its nodes entity 
        .post(config_controller.entity_self_access);

    app.route('/api/updateglobalaccessadmin')  //update global access flags from admin for a parent and its nodes entity 
        .post(config_controller.global_access);

    app.route('/api/updatetransactionslimitadmin')  //update global access flags from admin for a parent and its nodes entity 
        .post(config_controller.transactions_limit);

    app.route('/api/showconfigurations')  //show parent configurations 
        .post(config_controller.show_configurations);

    app.route('/api/readtxnconfigurationlogs')  //show parent configurations 
        .post(config_controller.read_txn_configuration_logs);

    app.route('/api/updateentityRevenuePercent')
        .post(config_controller.update_entity_Revenue_Percent);

    app.route('/api/entityRevenuechargesHistory')
        .post(config_controller.entity_Revenue_charges_History);

    app.route('/api/enallwalletlogreport')
        .post(controller.all_wallet_log_report);

    app.route('/api/enatomlogreportadmin')
        .post(controller.atom_log_report_admin);

 
    app.route('/api/UpdateKYCDocsEntity')
        .post(controller.Update_KYCDocsEntity_from_admin);


    app.route('/api/emailAlertRateUpdatedAdmin')
        .post(controller.emailAlertRateUpdatedAdmin);

    app.route('/api/addBillingEmail')
        .post(controller.add_Billing_Email);

    app.route('/api/emailSubscriberList')
        .post(controller.email_Subscriber_List);

    app.route('/api/partnerpermissionconsumer')
        .post(controller.partner_Permission);

    app.route('/api/partnerpermissionupdatelimit')
        .post(controller.partner_updatelimit);

    app.route('/api/partnerpermissionupdateWalletLimit')
        .post(controller.partner_updateWalletLimit);

    app.route('/api/partnerloadingrevenue').post(getChargesfromDB, controller.partner_loading_Revenue);
    app.route('/api/partnersideRevenue').post(getChargesfromDB, controller.partnerside_Revenue);
    app.route('/api/fetchentityStock').post(controller.fetchentity_Stock);
    app.route('/api/fetchCounter').post(controller.fetchCounter);
    app.route('/api/fetchentityDashStock').post(controller.fetchentityDash_Stock);
    app.route('/api/blockActivatePartnerAccount').post(controller.blockActivate_PartnerAccount);
    app.route('/api/walletPreview').post(controller.wallet_Preview);
    app.route('/api/partnerEarnedRevenueFromCompany').post(controller.partnerEarnedRevenueFromCompany);
    app.route('/api/setNodeWisePermission').post(config_controller.setNode_WisePermission);
    app.route('/api/updatenodePercentage').post(config_controller.update_nodePercentage);
    app.route('/api/getmostActiveTxn').post(controller.getmostActiveTxn);
    app.route('/api/addentitywalletfromadmin').post(controller.add_entity_wallet_from_admin);
    
}

function getChargesfromDB(req, res, next) {
    request.post({
        "headers": { "content-type": "application/json" },
        "url": conf.adminReqIP + ":5112/api/getAllCharges",
    }, (error, response, body) => {
        if (error) {
            console.log(error)
            res.json({ status: "500", message: "Internal Server Error" })
        } else {
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