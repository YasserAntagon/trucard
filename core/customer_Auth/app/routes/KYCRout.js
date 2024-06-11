'use strict';

module.exports = function (app) {
  let kyccontroller = require('../controllers/KYCController'),
    deviceLog = require('../controllers/deviceLog');
  app.route('/api')
    .get(kyccontroller.test);

  app.route('/api/registration')
    .post(kyccontroller.ins_registration);

  app.route('/api/consumervalidation')
    .post(kyccontroller.consumer_validation);

  app.route('/api/findUser')
    .post(kyccontroller.find_USER);

  app.route('/api/findconsumerQR')
    .post(kyccontroller.findconsumerQR);

  app.route('/api/updateimage')
    .post(kyccontroller.Update_Image);

  app.route('/api/otponreg')
    .post(kyccontroller.generate_otp_on_registration);


  app.route('/api/login')
    .post(kyccontroller.login_window);

  app.route('/api/updatekyc')
    .post(kyccontroller.Update_KYC);


  app.route('/api/listAddress')
    .post(kyccontroller.list_address);


  app.route('/api/listProfile')
    .post(kyccontroller.list_profile);


  app.route('/api/referenceregistrationprofile')
    .post(kyccontroller.reference_registration_profile_entity);


  app.route('/api/addkycdocs')
    .post(kyccontroller.add_kyc_docs)


  app.route('/api/addkycdocswithname')
    .post(kyccontroller.add_kyc_docs_with_name)


  app.route('/api/remkycdocs')
    .post(kyccontroller.remove_kyc_docs)

  app.route('/api/addressdetails')
    .post(kyccontroller.Update_address);

  app.route('/api/generateotp')
    .post(kyccontroller.generate_otp_on_registration)

  app.route('/api/verifyOTP')
    .post(kyccontroller.veriFy_otp_on)

  app.route('/api/updatepassword')
    .post(kyccontroller.update_password)

  app.route('/api/changepassword')
    .post(kyccontroller.change_password)

  app.route('/api/changepasswordsec')
    .post(kyccontroller.change_password_sec)

  app.route('/api/checkuser')
    .post(kyccontroller.check_user)

  app.route('/api/listprofileanyone')
    .post(kyccontroller.list_profile_anyone)

  app.route('/api/referenceregistration')
    .post(kyccontroller.ins_refferance_registration);

  app.route('/api/referenceregistrationimportjson')
    .post(kyccontroller.ins_refferance_registration_import_json);

  app.route('/api/addconsumerimportjson')
    .post(kyccontroller.add_consumer_import_json);

  app.route('/api/showcustomerprofileentityconsumer')
    .post(kyccontroller.show_customer_profile_for_entity_consumer);

  app.route('/api/referenceregistrationentityconsumer')
    .post(kyccontroller.ins_reference_registration_entity_consumer);


  app.route('/api/listprofileadmin')
    .post(kyccontroller.list_customer_profile_for_admin);


  app.route('/api/referenceregistrationadmin')
    .post(kyccontroller.ins_reference_registration_admin);


  app.route('/api/updatecustregadmin')
    .post(kyccontroller.update_cust_reg_admin);

  app.route('/api/updateKYCentityconsumer')
    .post(kyccontroller.Update_KYC_entity_consumer);

  app.route('/api/liststockentityconsumer')
    .post(kyccontroller.list_stock_entity_consumer);

  app.route('/api/custupkycflagadmin')
    .post(kyccontroller.cust_up_kyc_flag_admin);

  app.route('/api/consumerupdatekycflagadmin')
    .post(kyccontroller.consumer_update_kyc_flag_admin);

  app.route('/api/updatekycfromentity')
    .post(kyccontroller.Update_KYC_from_entity);

  app.route('/api/updatekycdocsfromentity')
    .post(kyccontroller.Update_KYCDocs_from_entity);

  app.route('/api/updatekycdocsfromentityconsumer')
    .post(kyccontroller.Update_KYCDocs_from_entity_consumer);

  app.route('/api/changeMPIN')
    .post(kyccontroller.change_MPIN);

  app.route('/api/loginmobility')
    .post(kyccontroller.login_window_mobility);

  app.route('/api/verifyMpinmobility')
    .post(kyccontroller.verify_Mpin_mobility);

  app.route('/api/countallconsumer')
    .post(kyccontroller.count_all_consumer);

  app.route('/api/generatereferencecode')
    .post(kyccontroller.generate_reference_code);

  app.route('/api/verifyreferencecode')
    .post(kyccontroller.verify_reference_code);

  app.route('/api/verifyemail')
    .post(kyccontroller.verify_email);

  app.route('/api/updateemail')
    .post(kyccontroller.update_email);

  /* app.route('/api/sendemailverificationlink')
    .post(kyccontroller.send_email_verification_link); */

  app.route('/api/verifyreferencecodeexternal')
    .post(kyccontroller.verify_reference_code_external);


  app.route('/api/checkIsValidConsumer')
    .post(kyccontroller.checkIsValidConsumer);

  app.route('/api/searchIsValidConsumer')
    .post(kyccontroller.searchIsValidConsumer);

  app.route('/api/searchIsValidConsumerLogin')
    .post(kyccontroller.searchIsValidConsumerLogin);


  app.route('/api/emailverificationOTP')
    .post(kyccontroller.email_verification_OTP);

  app.route('/api/emailverificationverify')
    .post(kyccontroller.email_verification_verify);

  app.route('/api/updateemailandsendOTP')
    .post(kyccontroller.update_email_and_send_OTP);

  app.route('/api/checkConsumerExistInAdmin')
    .post(kyccontroller.check_Consumer_Exist_In_Admin);

  app.route('/api/verifyConsumerDeviceHash')
    .post(deviceLog.verify_Consumer_Device_Hash);

  app.route('/api/insertupdateconsumerDeviceHash')
    .post(deviceLog.update_Consumer_Device_Hash);

  


  app.route('/api/updatecustDetails')
    .post(kyccontroller.update_Cust_Details_from_Entity);


  app.route('/api/addconsumerimportminimaljson')
    .post(kyccontroller.add_consumer_import_minimal_json);

  app.route('/api/entityDetailsfromEnMobile')
    .post(kyccontroller.entity_Details_from_EnMobile);

  app.route('/api/consumerDetailsUpdateBeforKYC')
    .post(kyccontroller.consumer_Details_Update_Befor_KYC);

  app.route('/api/updatekycdocsforindividual')
    .post(kyccontroller.Update_KYCDocs_for_Individual);


};
