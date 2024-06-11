const request = require('request'),
Gen = require("../../config");
var reqip = Gen.emailreqip;  
module.exports.email_registartion_admin =   function (email,fname,lname,password) {
  var mailmsg="Hi " + fname + "! Welcome to Company. Your temporary password is "+password+"";
       request.post({
        "headers": { "content-type": "application/json" ,"Authorization" : "Bearer " + Gen.bearer1001},
        "url": reqip + ":3114/onboardingConsumerFromAdmin",
        "body": JSON.stringify({
          "mailTo" : email,
          "mailmsg":mailmsg,
          "name":fname + " " + lname,
          "type" :"regFromAdmin",
          "mailtype" : "email"
        })
      }, (error,body) => {
        if(error) {
            return console.dir(error);
        }
           }
         )
       }



       module.exports.changePasswordMPIN =   function (flag,email,mobile,consumername,mailtype) {
        var msgheading = "",
           emailsubject = "",
           message = "",
           type = "";
        if(flag === "passwordReset"){
          type = "resetPassword"
          emailsubject = consumername + ",  your password was successfully reset.";
          message = " Greetings from Company , As Per your request, we have successfully changed your password.\n you can contact us for any reason, Thank you for being with us.";
        }else if(flag === "MPINReset"){
          type = "resetMPIN"
          emailsubject = consumername + ",  your Mobile PIN was successfully reset.";
          message = " Greetings from Company , As Per your request, we have successfully changed your mobile PIN.\n you can contact us for any reason, Thank you for being with us.";;
        }
          request.post({
          "headers": { "content-type": "application/json" ,"Authorization" : "Bearer " + Gen.bearer1002},
          "url": reqip + ":3114/1002",
          "body": JSON.stringify({
              "mailTo": email,
              "senderName": consumername,
              "msgHeading": msgheading,
              "emailSubject": emailsubject,
              "message":message ,
              "mobile":mobile,
              "mailtype":mailtype,
              "type": type
          })
        }, (error,body) => {
          if(error) {
              return console.dir(error);
          }
          // var newjson =  JSON.parse(body);
              }
            )
          }
      


    
module.exports.refRegistartionEntity = function (email,mobile,consumername,refname,mailURL2) {
  var date = Date.parse(new Date());
    var expiry = (date + Gen.emailExpiryTime).toString();
    let emailexpiry = Buffer.from(expiry, "utf8").toString("base64");
    var mailurl = mailURL1 + mailURL2 + "&exp=" + emailexpiry;
    
  request.post({
  "headers": { "content-type": "application/json" ,"Authorization" : "Bearer " + Gen.bearer4008},
  "url": reqip + ":3114/4008",
  "body": JSON.stringify({
      "mailTo": email,
      "Name": consumername,
      "emailSubject": "Welcome to Company!",
      "refName" : refname,
      "verifyLink" :mailurl,
      "type": "consumer",
      "mobile":mobile,
      "mailtype":"both"
  })
}, (error,body) => {
  if(error) {
      return console.dir(error);
  }
  // var newjson =  JSON.parse(body);
      }
    )
  }
      
  //   function retDateObj(dateobj,changepwddate){
  //     var d = new Date(dateobj);
      
  // // const options = {
  // //   day: 'numeric',
  // //   month: 'numeric',
  // //   // weekday: 'short',
  // //   hour: 'numeric',
  // //   minute: 'numeric',
  // //   second:'numeric',
  // //   year:'numeric',
  // //   timeZoneName :"short",
  // //   hour12:false
  // // };
  
  // // console.log(d.toLocaleString('en-IN', options));
  //   // var dateobj = 
  //   // var daysIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  //   if(changepwddate == true){
  //         return (  d.getDate() + "/" + d.toLocaleString('default', { month: 'short' }) +"/" +  d.getFullYear()+ ", " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " IST ");
  //   }else{
  //         return (daysIndex[d.getDay()] + " " + d.toLocaleString('default', { month: 'short' }) + ' ' + 
  //                 d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " IST " +
  //                  d.getFullYear());
  //   }
  
  //   }