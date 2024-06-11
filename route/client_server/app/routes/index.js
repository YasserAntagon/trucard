var express = require('express');
var router = express.Router();
// console.log = function() {}; // Enable when wanted to remove all console.log
router.get('/', function (req, res, next) {
    res.render('index', { title: "" });
});
module.exports = router;