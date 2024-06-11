'use strict';

module.exports = function(app) {
  var controller = require('../controllers/controller'); 
  app.route('/601')
  .post(controller.SixhundredAndOne);
  app.route('/602')
  .post(controller.SixhundredAndTwo);  
};
