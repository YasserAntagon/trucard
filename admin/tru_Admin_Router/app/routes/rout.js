'use strict';


var KycAll = require('../models/adminKYCAllModel');

module.exports = function (app) {
  var controller = require('../controllers/controller');
 
  function verifyMHash(req, res, next) {
    if (req.body.type === "mHash") {
      next();
    } else {
      const mhash = req.headers.mhash;
      let truid = req.body.truID;
      if (req.originalUrl === "/101" || req.originalUrl === "/104") {
        truid = req.body.email;
      } else if (req.originalUrl === "/100") {
        truid = req.body.refrenceID;
      }
      if (truid) {
        KycAll.aggregate([{ $match: { $or: [{ truID: truid }, { email: truid }] } },
          { $project: { _id: 0, machineHash: 1, mobile: 1, mHashVerified: 1 } }]).exec(function (err, resultdocs) {
            if (resultdocs && resultdocs.length >= 0) {
              if (mhash && resultdocs[0].mHashVerified === true && resultdocs[0].machineHash === mhash) {
                next();
              } else { 
                if (!resultdocs.length) {
                  res.json({ status: "204", message: "Invalid credentials" });
                } else {
                  res.json({ status: "401", message: "Access denied!", mobile: resultdocs[0].mobile });
                }
              }
            }
            else {
              res.json({ status: "204", message: "User Does not exist..!" });
            }
          })
      } else {
        res.json({ status: "401", message: "Access denied!" });
      }
    }
  }; 
  app.route('/api')
    .get(controller.test);

  app.route('/100')
    .post(verifyMHash, controller.hundred);

  app.route('/101')
    .post(verifyMHash, controller.hundredone);

  app.route('/102')
    .post(verifyMHash, controller.hundredtwo);

  app.route('/103')
    .post(verifyMHash, controller.hundredthree);

  app.route('/104')
    .post(verifyMHash, controller.hundredfour);

  app.route('/105')
    .post(verifyMHash, controller.hundredfive);

  app.route('/106')
    .post(verifyMHash, controller.hundredsix);

  app.route('/107')
    .post(verifyMHash, controller.hundredseven);

  app.route('/108')
    .post(verifyMHash, controller.hundredeight);

  app.route('/109')
    .post(verifyMHash, controller.hundrednine);

  app.route('/110')
    .post(verifyMHash, controller.hundredten);

  app.route('/111')
    .post(verifyMHash, controller.hundredeleven);

  app.route('/112')
    .post(verifyMHash, controller.hundretwelve);

  app.route('/113')
    .post(verifyMHash, controller.hundredthirteen);

  app.route('/114')
    .post(verifyMHash, controller.hundredfourteen);

  app.route('/115')
    .post(verifyMHash, controller.hundredfifteen);

  app.route('/116')
    .post(verifyMHash, controller.hundredsixteen);

  app.route('/117')
    .post(verifyMHash, controller.hundredseventeen);

  app.route('/118')
    .post(verifyMHash, controller.hundredeighteen);

  app.route('/119')
    .post(verifyMHash, controller.hundrednineteen);

  app.route('/120')
    .post(verifyMHash, controller.hundredtwenty);

  app.route('/121')
    .post(verifyMHash, controller.hundredtwentyone);

  app.route('/122')
    .post(verifyMHash, controller.hundredtwentytwo);

  app.route('/123')
    .post(verifyMHash, controller.hundredtwentythree);

  app.route('/124')
    .post(verifyMHash, controller.hundredtwentyfour);

  app.route('/125')
    .post(verifyMHash, controller.hundredtwentyfive);

  app.route('/126')
    .post(verifyMHash, controller.hundredtwentysix);

  app.route('/127')
    .post(verifyMHash, controller.hundredtwentyseven);

  app.route('/128')
    .post(verifyMHash, controller.hundredtwentyeight);

  app.route('/129')
    .post(verifyMHash, controller.hundredtwentynine);

  app.route('/130')
    .post(verifyMHash, controller.hundredthirty);

  app.route('/131')
    .post(verifyMHash, controller.hundredthirtyone);

  app.route('/132')
    .post(verifyMHash, controller.hundredthirtytwo);

  app.route('/133')
    .post(verifyMHash, controller.hundredthirtythree);

  app.route('/134')
    .post(verifyMHash, controller.hundredthirtyfour);

  app.route('/135')
    .post(verifyMHash, controller.hundredthirtyfive);

  app.route('/136')
    .post(verifyMHash, controller.hundredthirtysix);

  app.route('/137')
    .post(verifyMHash, controller.hundredthirtyseven);

  app.route('/138')
    .post(verifyMHash, controller.hundredthirtyeight);

  app.route('/139')
    .post(verifyMHash, controller.hundredthirtynine);

  app.route('/140')
    .post(verifyMHash, controller.hundredforty);

  app.route('/141')
    .post(verifyMHash, controller.hundredfortyone);

  app.route('/142')
    .post(verifyMHash, controller.hundredfortytwo);

  app.route('/143')
    .post(verifyMHash, controller.hundredfortythree);

  app.route('/144')
    .post(verifyMHash, controller.hundredfortyfour);

  /////////////////////////////assetstore admin API//////////////////////////////////
  app.route('/145')
    .post(verifyMHash, controller.hundredfortyfive);

  app.route('/146')
    .post(verifyMHash, controller.hundredfortysix);

  app.route('/147')
    .post(verifyMHash, controller.hundredfortyseven);

  app.route('/148')
    .post(verifyMHash, controller.hundredfortyeight);

  app.route('/149')
    .post(verifyMHash, controller.hundredfortynine);

  app.route('/150')
    .post(verifyMHash, controller.hundredfifty);
 
  //////////////////////////////////////////////Entity Apis///////////////////////////////////////////////
  app.route('/152')
    .post(verifyMHash, controller.hundredfiftytwo);

  app.route('/153')
    .post(verifyMHash, controller.hundredfiftythree);

  app.route('/154')
    .post(verifyMHash, controller.hundredfiftyfour);

  app.route('/155')
    .post(verifyMHash, controller.hundredfiftyfive);

  app.route('/156')
    .post(verifyMHash, controller.hundredfiftysix);

  app.route('/157')
    .post(verifyMHash, controller.hundredfiftyseven);

  app.route('/158')
    .post(verifyMHash, controller.hundredfiftyeight);
 

  app.route('/160')
    .post(verifyMHash, controller.hundredsixty);

  app.route('/161')
    .post(verifyMHash, controller.hundredsixtyone);

  app.route('/162')
    .post(controller.hundredsixtytwo);

  app.route('/163')
    .post(verifyMHash, controller.hundredsixtythree);

  app.route('/164')
    .post(verifyMHash, controller.hundredsixtyfour);

  app.route('/165')
    .post(verifyMHash, controller.hundredsixtyfive);

  app.route('/166')
    .post(verifyMHash, controller.hundredsixtysix);

  app.route('/167')
    .post(verifyMHash, controller.hundredsixtyseven);

  app.route('/168')
    .post(verifyMHash, controller.hundredsixtyeight);

  app.route('/169')
    .post(verifyMHash, controller.hundredsixtynine);

  app.route('/170')
    .post(verifyMHash, controller.hundredseventy);

  app.route('/171')
    .post(verifyMHash, controller.hundredseventyone);

  app.route('/172')
    .post(verifyMHash, controller.hundredseventytwo);

  app.route('/173')
    .post(verifyMHash, controller.hundredseventythree);

  app.route('/174')
    .post(verifyMHash, controller.hundredseventyfour);

  app.route('/175')
    .post(verifyMHash, controller.hundredseventyfive);

  app.route('/176')
    .post(verifyMHash, controller.hundredseventysix);

  app.route('/177')
    .post(verifyMHash, controller.hundredseventyseven);

  app.route('/178')
    .post(verifyMHash, controller.hundredseventyeight);

  app.route('/179')
    .post(verifyMHash, controller.hundredseventynine);

  app.route('/180')
    .post(verifyMHash, controller.hundredeighty);

  app.route('/181')
    .post(verifyMHash, controller.hundredeightyone);

  app.route('/182')
    .post(verifyMHash, controller.hundredeightytwo);

  app.route('/183')
    .post(verifyMHash, controller.hundredeightythree);

  app.route('/184')
    .post(verifyMHash, controller.hundredeightyfour);

  app.route('/185')
    .post(verifyMHash, controller.hundredeightyfive);

  app.route('/186')
    .post(verifyMHash, controller.hundredeightysix);

  app.route('/187')
    .post(verifyMHash, controller.hundredeightyseven);

  app.route('/188')
    .post(verifyMHash, controller.hundredeightyeight);

  app.route('/189')
    .post(verifyMHash, controller.hundredeightynine);


  app.route('/191')
    .post(verifyMHash, controller.hundredninetyone);

  app.route('/192')
    .post(verifyMHash, controller.hundredninetytwo);

  app.route('/193')
    .post(verifyMHash, controller.hundredninetythree);

  app.route('/194')
    .post(verifyMHash, controller.hundredninetyfour);

  app.route('/195')
    .post(verifyMHash, controller.hundredninetyfive);

  app.route('/196')
    .post(verifyMHash, controller.hundredninetysix);

  app.route('/197')
    .post(verifyMHash, controller.hundredninetyseven);

  app.route('/198')
    .post(verifyMHash, controller.hundredninetyeight);

  app.route('/199')
    .post(verifyMHash, controller.hundredninetynine);


  app.route('/203')
    .post(verifyMHash, controller.twohundredthree);

  app.route('/204')
    .post(verifyMHash, controller.twohundredfour);

  app.route('/205')
    .post(verifyMHash, controller.twohundredfive);


  app.route('/207')
    .post(verifyMHash, controller.twohundredseven);

  app.route('/208')
    .post(verifyMHash, controller.twohundredeight);

  app.route('/209')
    .post(verifyMHash, controller.twohundrednine);

  app.route('/210')
    .post(verifyMHash, controller.twohundreten);

  app.route('/211')
    .post(verifyMHash, controller.twohundreleven);

  app.route('/212')
    .post(verifyMHash, controller.twohundredtwelve);

  app.route('/213')
    .post(verifyMHash, controller.twohundredthirteen);

  app.route('/214')
    .post(verifyMHash, controller.twohundredfourteen);

  app.route('/215')
    .post(verifyMHash, controller.twohundredfifteen);

  app.route('/216')
    .post(verifyMHash, controller.twohundredsixteen);


  app.route('/218')
    .post(verifyMHash, controller.twohundredeighteen);

  app.route('/219')
    .post(verifyMHash, controller.twohundredninteen);

  app.route('/220')
    .post(verifyMHash, controller.twohundredtwenty);

  app.route('/221')
    .post(verifyMHash, controller.twohundredtwentyone);

  app.route('/222')
    .post(verifyMHash, controller.twohundredtwentytwo);

  app.route('/223')
    .post(verifyMHash, controller.twohundredtwentythree);

  app.route('/224')
    .post(verifyMHash, controller.twohundredtwentyfour);

  app.route('/225')
    .post(verifyMHash, controller.twohundredtwentyfive);

  app.route('/226')
    .post(verifyMHash, controller.twohundredtwentysix);

  app.route('/227')
    .post(verifyMHash, controller.twohundredtwentyseven);

  app.route('/228')
    .post(verifyMHash, controller.twohundredtwentyeight);

  app.route('/229')
    .post(verifyMHash, controller.twohundredtwentynine);

  app.route('/230')
    .post(verifyMHash, controller.twohundredthirty);

  app.route('/231')
    .post(verifyMHash, controller.twohundredthirtyone);

  app.route('/232')
    .post(verifyMHash, controller.twohundredthirtytwo);

  app.route('/233')
    .post(verifyMHash, controller.twohundredthirtythree);

  app.route('/234')
    .post(verifyMHash, controller.twohundredthirtyfour);

  app.route('/235')
    .post(verifyMHash, controller.twohundredthirtyfive);


  app.route('/237')
    .post(verifyMHash, controller.twohundredthirtyseven);


  app.route('/239')
    .post(verifyMHash, controller.twohundredthirtynine);

  app.route('/240')
    .post(controller.twohundredforty);

  app.route('/241')
    .post(verifyMHash, controller.twohundredfortyone);

  app.route('/242')
    .post(verifyMHash, controller.twohundredfortytwo);

  app.route('/243')
    .post(verifyMHash, controller.twohundredfortythree);

  app.route('/244')
    .post(verifyMHash, controller.twohundredfortyfour);

  app.route('/245')
    .post(verifyMHash, controller.twohundredfortyfive);

  app.route('/246')
    .post(verifyMHash, controller.twohundredfortysix);

  app.route('/247')
    .post(verifyMHash, controller.twohundredfortyseven);

  app.route('/249')
    .post(verifyMHash, controller.twohundredfortynine);

  app.route('/250')
    .post(verifyMHash, controller.twohundredfifty);

  app.route('/251')
    .post(verifyMHash, controller.twohundredfiftyone);

  app.route('/260')
    .post(verifyMHash, controller.twohundredsixty);

  app.route('/261')
    .post(verifyMHash, controller.twohundredsixtyone);

  app.route('/262')
    .post(verifyMHash, controller.twohundredsixtytwo);

  app.route('/263')
    .post(verifyMHash, controller.twohundredsixtythree);

  app.route('/264')
    .post(verifyMHash, controller.twohundredsixtyfour);

  app.route('/265')
    .post(verifyMHash, controller.twohundredsixtyfive);

    app.route('/266')
    .post(verifyMHash, controller.twohundredsixtysix);

  app.route('/267')
    .post(verifyMHash, controller.twohundredsixtyseven);

  app.route('/268')
    .post(verifyMHash, controller.twohundredsixtyeight);

  app.route('/269')
    .post(verifyMHash, controller.twohundredsixtynine);

  app.route('/270')
    .post(verifyMHash, controller.twohundredseventy);

  app.route('/271')
    .post(verifyMHash, controller.twohundredseventyone);

  app.route('/272')
    .post(verifyMHash, controller.twohundredseventytwo);


  app.route('/273')
    .post(verifyMHash, controller.twohundredseventyThree);

  app.route('/274')
    .post(verifyMHash, controller.twohundredseventyFour);


  app.route('/276')
    .post(verifyMHash, controller.twohundredseventySix);

  app.route('/277')
    .post(verifyMHash, controller.twohundredseventySeven);

  app.route('/278')
    .post(verifyMHash, controller.twohundredseventyEight);

  app.route('/279')
    .post(verifyMHash, controller.twohundredseventyNine);

  app.route('/280')
    .post(verifyMHash, controller.twohundredeighty);


  app.route('/281')
    .post(verifyMHash, controller.twohundredeightyOne);

  app.route('/282')
    .post(verifyMHash, controller.twohundredeightyTwo);

  app.route('/283')
    .post(verifyMHash, controller.twohundredeightythree);

  app.route('/284')
    .post(verifyMHash, controller.twohundredeightyfour);

  app.route('/285')
    .post(verifyMHash, controller.twohundredeightyfive);

  app.route('/286')
    .post(verifyMHash, controller.twohundredeightysix);

  app.route('/287')
    .post(verifyMHash, controller.twohundredeightySeven);

  app.route('/288')
    .post(verifyMHash, controller.twohundredeightyEight);

  app.route('/289')
    .post(verifyMHash, controller.twohundredeightyNine);

  app.route('/290')
    .post(verifyMHash, controller.twohundredNinty);

  app.route('/291')
    .post(verifyMHash, controller.twohundredNintyOne);

  app.route('/292')
    .post(verifyMHash, controller.twohundredNintyTwo);


  app.route('/294')
    .post(verifyMHash, controller.twohundredNintyFour);

  app.route('/295')
    .post(verifyMHash, controller.twohundredNintyFive);

  app.route('/297')
    .post(verifyMHash, controller.twohundredNintySeven);

  app.route('/298')
    .post(verifyMHash, controller.twohundredNintyEight);

  app.route('/299')
    .post(verifyMHash, controller.twohundredninetynine);

  app.route('/300')
    .post(verifyMHash, controller.threehundred);

  app.route('/301')
    .post(verifyMHash, controller.threehundredone);

  app.route('/302')
    .post(verifyMHash, controller.threehundredtwo);

  app.route('/330')
    .post(verifyMHash, controller.threehundredthirty);

  app.route('/331')
    .post(verifyMHash, controller.threehundredthirtyone);

  app.route('/332')
    .post(verifyMHash, controller.threehundredthirtytwo);
    
  app.route('/emailAlertRateUpdated')
    .post(verifyMHash, controller.emailAlert_RateUpdated);

}
