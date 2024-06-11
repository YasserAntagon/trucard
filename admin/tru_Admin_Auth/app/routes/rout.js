'use strict';

module.exports = function (app) {
  var controller = require('../controllers/controller');

  app.route('/api')
    .get(controller.test);


  app.route('/api/registration')
    .post(controller.ins_registration);

  app.route('/api/login')
    .post(controller.login_window);

  app.route('/api/updatetransactionpin')
    .post(controller.update_transaction_pin);


  app.route('/api/verifytransactionpin')
    .post(controller.verify_transaction_pin);

  app.route('/api/updateimage')
    .post(controller.update_image);


  app.route('/api/updatereg')
    .post(controller.update_reg);


  app.route('/api/updateempemail')
    .post(controller.update_emp_email);


  app.route('/api/profile')
    .post(controller.list_profile);


  app.route('/api/listprofiletruid')
    .post(controller.list_profile_truid);


  app.route('/api/changepassword')
    .post(controller.change_password);


  app.route('/api/adddepartment')
    .post(controller.ins_department);


  app.route('/api/updateaddress')
    .post(controller.update_address);


  app.route('/api/updatebankdetails')
    .post(controller.update_bank_details);


  app.route('/api/updateempdoc')
    .post(controller.update_emp_doc);

  ///////////////////////////////Company APIs//////////////////////////////////////////////
  app.route('/api/companyregistration')
    .post(controller.ins_company_registration);

  app.route('/api/updatecompanyaddress')
    .post(controller.update_company_address);

  app.route('/api/updatecompanybankdetails')
    .post(controller.update_company_bank_details);

  app.route('/api/companyprofile')
    .post(controller.list_company_profile);

  app.route('/api/updatecompanyregdetails')
    .post(controller.update_company_registration_details);


  ////////////////////////////Company Branch/////////////////////////////////////////////


  app.route('/api/companybranchregistration')
    .post(controller.ins_company_branch_registration);

  app.route('/api/updatecompanybranchaddress')
    .post(controller.update_company_branch_address);

  app.route('/api/updatecompanybranchpropertydetails')
    .post(controller.update_company_branch_property_details);

  app.route('/api/companybranchprofile')
    .post(controller.list_company_branch_profile);

  app.route('/api/updatecompanybranchdetails')
    .post(controller.update_company_branch_details);

  ////////////////////////Group apis//////////////////////////////////////////////


  app.route('/api/updatepermission')
    .post(controller.update_permission);

  app.route('/api/listallcharges')
    .post(controller.list_all_charges);

  app.route('/api/updateempdocsfileuplod')
    .post(controller.Update_empDocs_file_uplod);

  app.route('/api/updaterentdocscompanylocations')
    .post(controller.Update_rentedDocs_for_company_locations);

  app.route('/api/adminvalidation')
    .post(controller.admin_validation);

  app.route('/api/getAllCharges')
    .post(controller.get_All_Charges);

  app.route('/api/getAllChargesDateWise')
    .post(controller.get_All_ChargesDateWise);

  app.route('/api/getAllChargesBetweenDate')
    .post(controller.get_All_ChargesbetweenDate);

  app.route('/api/changechargescustomer')
    .post(controller.change_charges_customer);
}