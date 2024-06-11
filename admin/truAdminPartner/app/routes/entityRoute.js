'use strict';

var econtroller = require('../controllers/entityController');
module.exports = function (app) {
    app.route('/api/fetchBindSelfEntity')
        .post(econtroller.fetchBind_Self_Entity);

    app.route('/api/fetchNodeByNameMobile')
        .post(econtroller.fetchNode_ByNameMobile);

    app.route('/api/nodeList')
        .post(econtroller.node_List);

    app.route('/api/bindWalletLog')
        .post(econtroller.bind_WalletLog);

    app.route('/api/fetchNode')
        .post(econtroller.fetchNode);

    app.route('/api/countNode')
        .post(econtroller.countNode);
        
    app.route('/api/selfalltxnreportRevenue')
        .post(econtroller.entity_all_txn_reportRevenue);
}