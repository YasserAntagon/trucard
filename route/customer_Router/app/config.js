
var fs = require('fs')
var path = require('path')
let server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../confServers.json')));
var bearerstr = "#aPiS$1234@5678!";

module.exports = {
  reqip: server.clusterServer,    
  adminCore: server.adminCore,    
  cdnurl: server.cdn,
  bankUrl: server.bankServer,
  pgServer: server.pgServer,
  enkey: "202278d545d4452",
  acEnkey: "~*MyINSPL@66Devi*~",
  bearer: bearerstr + "0123#",
  bearer1: bearerstr + "1234#",
  bearer2: bearerstr + "2345#",
  bearer3: bearerstr + "3456#",
  bearer4: bearerstr + "4567#",
  bearer5: bearerstr + "5678#",
  bearer6: bearerstr + "6789#",
  bearer7: bearerstr + "7891#",
  bearer8: bearerstr + "8912#",
  bearer9: bearerstr + "9123#",
  bearer10: bearerstr + "12345#",
  bearer11: bearerstr + "23456#",
  bearer12: bearerstr + "34567#",
  bearer13: bearerstr + "45678#",
  bearer14: bearerstr + "56789#",
  bearer15: bearerstr + "67891#",
  bearer16: bearerstr + "78912#",
  bearer17: bearerstr + "89123#",
  bearer18: bearerstr + "91234#",
  bearer19: bearerstr + "123456#",
  bearer20: bearerstr + "234567#",
  bearer21: bearerstr + "345678#",
  bearer22: bearerstr + "456789#",
  bearer23: bearerstr + "1234567#",
  bearer24: bearerstr + "2345678#",
  bearer25: bearerstr + "3456789#",
  bearer26: bearerstr + "4567891#",
  bearer27: bearerstr + "5678912#",
  bearer28: bearerstr + "6789123#",
  bearer29: bearerstr + "7891234#",
  bearer30: bearerstr + "8912345#",
  bearer31: bearerstr + "9123456#",
  bearer32: bearerstr + "1234567#",
  bearer33: bearerstr + "2345678#",
  bearer34: bearerstr + "3456789#",
  bearer35: bearerstr + "4567890#",  
  bearer57: bearerstr + "5678901#",
  bearer58: bearerstr + "r$b#l!5678901#",
  bearer59:"#58aPiSN$I1K2H3I4L@6525!psvx3KYdao$#",
  bearer60: bearerstr + "GpsSHx3KYda$#",
  ten: {
    email: "mandatory",
    mobile: "mandatory",
    password: "mandatory",
    fName: "mandatory",
    lName: "mandatory",
    KYCFlag: "mandatory",
    countryCode: "mandatory",
    mName: "notmandatory",
    gender: "mandatory",
    DOB: "mandatory",
    language: "mandatory",
    nationality: "mandatory",
    residence: "mandatory",
    referenceID: "mandatory",
    truID: "mandatory",
    CRNNo: "mandatory",
  },
  eleven: {
    userName: "mandatory",
    password: "mandatory"
  },
  twelve: {
    truID: "mandatory",
    houseNumber: "mandatory",
    streetNumber: "mandatory",
    landmark: "mandatory",
    pin: "mandatory",
    city: "mandatory",
    state: "mandatory",
    country: "mandatory",
    pHouseNumber: "mandatory",
    pStreetNumber: "mandatory",
    pLandmark: "mandatory",
    pPin: "mandatory",
    pCity: "mandatory",
    pState: "mandatory",
    pCountry: "mandatory"
  },




  thrteen: {
    truID: "mandatory"
  },


  fourteen: {
    truID: "mandatory"
  },


  fifteen: {
    truID: "mandatory",
    title: "mandatory",
    number: "mandatory",
    file: "mandatory"
  },


  sixteen: {
    truID: "mandatory",
    title: "mandatory"
  },


  seventeen: {
    truID: "mandatory",
    bTruID: "mandatory",
    nickName: "notmandatory"
  },


  eighteen: {
    bTruID: "mandatory"
  },


  nineteen: {
    truID: "mandatory"
  },


  twenty: {
    truID: "mandatory",
    bTruID: "mandatory"
  },


  twentyone: {
    truID: "mandatory",
    bName: "mandatory",
    IFSC: "mandatory",
    branchName: "mandatory",
    address: "mandatory",
    city: "mandatory",
    custName: "mandatory",
    accountNo: "mandatory",
    accType: "mandatory",
    relationship: "mandatory"
  },


  twentytwo: {
    truID: "mandatory",
    nameOnCard: "mandatory",
    cardNo: "mandatory",
    exp: "mandatory",
    CVV: "mandatory"
  },


  twentythree: {
    truID: "mandatory",
    walletName: "mandatory",
    email: "mandatory",
    mobile: "mandatory"
  },


  twentyfour: {
    truID: "mandatory",
    accountNo: "mandatory"
  },


  twentyfive: {
    truID: "mandatory",
    cardNo: "mandatory"
  },


  twentysix: {
    truID: "mandatory",
    mobile: "mandatory",
    walletName: "mandatory"
  },


  twentyseven: {
    truID: "mandatory",
    accType: "mandatory"
  },


  twentyeight: {
    truID: "mandatory"
  },


  twentynine: {
    truID: "mandatory"
  },


  thirty: {
    truID: "mandatory",
    flag: "mandatory",
    city: "notmandatory",
    country: "notmandatory",
    countryCode: "mandatory"
  },


  thirtyone: {
    truID: "mandatory",
    city: "notmandatory",
    country: "notmandatory",
    countryCode: "mandatory"
  },


  thirtytwo: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory"
  },


  thirtythree: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory"
  },


  thirtyfour: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory"
  },


  thirtyfive: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory"
  },


  thirtysix: {
    truID: "mandatory",
    receiver: "mandatory",
    toTruID: "mandatory",
    fromTruID: "mandatory",
    fromName: "mandatory",
    G24qty: "mandatory",
    
    
    S99qty: "mandatory",
    transactionType: "mandatory",
    bullionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory",
    amount: "mandatory"
  },


  thirtyseven: {
    toTruID: "mandatory",
    bankName: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    loanAmt: "mandatory"
  },


  thirtyeight: {
    truID: "mandatory"
  },


  thirtyeight: {
    truID: "mandatory"
  },




  thirtynine: {
    truID: "mandatory"
  },


  fourty: {
    truID: "mandatory"
  },


  fourtyone: {
    truID: "mandatory",
    invoice: "mandatory"
  },


  fourtytwo: {
    mobile: "mandatory",
    otp: "mandatory",
    type: "mandatory",
    detail: "mandatory",
    appFlag: "notmandatory"

  },


  fourtythree: {
    mobile: "mandatory",
    OTP: "mandatory"
  },


  fourtyfour: {
    city: "mandatory",
    country: "mandatory",
    countryCode: "mandatory"
  },


  fourtyfive: {
    city: "mandatory",
    country: "mandatory",
    countryCode: "mandatory"
  },


  fourtysix: {
    truID: "mandatory"
  },


  fourtyseven: {
    toTruID: "mandatory",
    fromTruID: "mandatory",
    fromName: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory"
  },


  fourtyeight: {
    truID: "mandatory"
  },


  fourtynine: {
    truID: "mandatory",
    invoice: "mandatory",
    PGFlag: "mandatory",
    amount: "mandatory"
  },

  fifty: {
    truID: "mandatory",
    newPassword: "mandatory",
    oldPassword: "mandatory"
  },

  fiftyone: {
    mobile: "mandatory",
    newPassword: "mandatory"
  },


  fiftytwo: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24Amt: "mandatory",
    S99Amt: "mandatory",
    G24Rate: "mandatory",
    
    
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory"
  },


  fiftythree: {
    mobile: "mandatory",
    email: "notmandatory"
  },


  fiftyfour: {
    truID: "mandatory",
    assetmanagerSearch: "mandatory"
  },


  fiftyfive: {
    email: "mandatory",
    mobile: "mandatory"
  },


  fiftysix: {
    IFSC: "mandatory",
    truID: "mandatory"
  },


  fiftyseven: {
    truID: "mandatory"
  },


  fiftyeight: {
    truID: "mandatory"
  },


  fiftynine: {
    truID: "mandatory",
    bTruID: "mandatory"
  },


  sixty: {
    truID: "mandatory",
    flag: "mandatory",
    date: "mandatory"
  },


  sixtyone: {
    truID: "mandatory",
    flag: "mandatory",
    startDate: "mandatory",
    endDate: "mandatory"
  },


  sixtytwo: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory"
  },


  sixtythree: {
    toTruID: "mandatory",
    fromTruID24: "mandatory",
   
    
    fromTruID99: "mandatory",
    G24Name: "mandatory",
    
   
    S99Name: "mandatory",
    G24qty: "mandatory",
    G24Rate: "mandatory",
    
    
    
    
    S99qty: "mandatory",
    S99Rate: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory"
  },


  sixtyfour: {
    truID: "mandatory",
    flag: "mandatory",
    startDate: "mandatory",
    endDate: "mandatory"
  },


  sixtyfive: {
    truID: "mandatory",
    bTruID: "mandatory",
    fav: "mandatory"
  },


  sixtysix: {
    email: "mandatory",
    mobile: "mandatory",
    password: "mandatory",
    countryCode: "mandatory",
    fName: "mandatory",
    mName: "mandatory",
    lName: "mandatory",
    KYCFlag: "mandatory",
    refernceTruID: "mandatory"
  },


  sixtyseven: {
    truID: "mandatory",
    image: "mandatory"
  },


  sixtyeight: {
    receiver: "mandatory",
    truID: "mandatory"
  },


  sixtynine: {
    truID24: "mandatory",
    truID22: "mandatory",
    truID18: "mandatory",
    truID99: "mandatory"
  },


  seventy: {
    invoice: "mandatory",
    atomID: "mandatory",
    bankTxnID: "mandatory",
    amount: "mandatory",
    invoiceAmount: "mandatory",
    surcharge: "mandatory",
    aStatus: "mandatory",
    customerTruID: "mandatory",
    tType: "mandatory",
    prodID: "notmandatory",
    bankName: "notmandatory",
    atomMOP: "notmandatory",
    cardNumber: "notmandatory",
    failureReason: "notmandatory",
    userName: "notmandatory",
    email: "notmandatory",
    mobile: "notmandatory",
    address: "notmandatory",
    date: "notmandatory"
  },


  seventytwo: {
    truID: "mandatory",
    skip: "mandatory"
  },


  seventythree: {
    hash: "mandatory"
  },


  seventyfour: {
    hash: "mandatory"
  },


  seventyfive: {
    truID: "mandatory"
  },


  seventysix: {
    hash: "mandatory",
    truID: "mandatory"
  },


  seventyseven: {
    hash: "mandatory",
    truID: "mandatory"
  },


  seventyeight: {
    truID: "mandatory"
  },


  eighty: {
    truID: "mandatory",
    invoice: "mandatory"
  },


  eightyone: {
    notificationID: "mandatory",
    isRead: "mandatory",
    notifyTo: "mandatory"
  },


  eightytwo: {
    skip: "mandatory",
    notifyTo: "mandatory"
  },


  eightythree: {
    truID: "mandatory",
    invoice: "mandatory"
  },


  eightyfive: {
    truID: "mandatory",
    amTruID: "mandatory",
    rate: "mandatory",
    quantity: "notmandatory",
    assetmanagerName: "mandatory",
    bullionType: "mandatory",
    type: "mandatory",
    amount: "notmandatory"
  },

  eightysix: {
    truID: "mandatory"
  },


  eightyseven: {
    truID: "mandatory"
  },

  eightyeight: {
    truID: "mandatory",
    docNumber: "mandatory",
    nameOnDoc: "mandatory",
    docTitle: "mandatory"
  },


  eightynine: {
    toTruID: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory",
    PGType: "notmandatory",
  },


  ninety: {
    toTruID: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory"
  },


  ninetyone: {
    toTruID: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory",
    PGType: "notmandatory"
  },


  ninetytwo: {
    truID: "mandatory"
  },


  ninetythree: {
    toTruID: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },


  ninetyfour: {
    truID: "mandatory",
    startDate: "mandatory",
    endDate: "mandatory"
  },


  ninetyfive: {
    toTruID: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory"
  },


  ninetysix: {
    toTruID: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },

  ninetyseven: {
    truID: "mandatory",
    startDate: "notmandatory",
    endDate: "notmandatory",
    dateFlag: "notmandatory"
  },


  ninetyeight: {
    truID: "mandatory"
  },


  ninetynine: {
    toTruID: "mandatory",
    lTruID: "mandatory",
    G24qty: "mandatory",
    
    
    S99qty: "mandatory",
    transactionType: "mandatory",
    status: "mandatory",
    fromName: "mandatory",
    invoice: "mandatory"
  },


  hundred: {
    truID: "mandatory"
  },


  hundredone: {
    truID: "mandatory",
    invoice: "mandatory"
  },

  hundredtwo: {
    truID: "mandatory",
    amTruID: "mandatory",
    qty: "mandatory",
    bullionType: "mandatory",
    transactionType: "mandatory"
  },

  hundredthree: {
    truID: "mandatory"
  },


  hundredfive: {
    truID: "mandatory",
    kycDetails: "mandatory",
    flag: "mandatory"
  },

  hundredfive: {
    truID: "mandatory",
    kycDetails: "mandatory",
    flag: "mandatory"
  },


  hundredsix: {
    truID: "mandatory"
  },


  hundredseven: {
    truID: "mandatory",
    date: "mandatory"
  },

  hundredeight: {
    email: "notmandatory",
    mobile: "notmandatory"
  },

  hundrednine: {
    truID: "mandatory",
    invoice: "mandatory"
  },

  hundredten: {
    truID: "mandatory",
    startDate: "mandatory",
    dateFlag: "notmandatory"
  },

  hundredeleven: {
    truID: "mandatory",
    startDate: "notmandatory",
    dateFlag: "notmandatory"
  },

  hundredtwelve: {
    truID: "mandatory",
    startDate: "notmandatory",
    dateFlag: "notmandatory"
  },

  hundredthirteen: {
    mobile: "mandatory",
    mPIN: "mandatory"
  },

  hundredfourteen: {
    truID: "mandatory",
    userName: "mandatory",
    mPIN: "notmandatory",
    password: "notmandatory"
  },

  hundredfifteen: {
    truID: "mandatory",
    skip: "mandatory"
  },
  hundredsixteen: {
    mobile: "mandatory",
    type: "mandatory"
  },
  hundredseventeen: {
    mobile: "mandatory",
    type: "mandatory",
    OTP: "mandatory"
  },
  hundredeighteen: {
    truID: "mandatory"
  },

  hundrednineteen: {
    truID: "mandatory",
    startDate: "notmandatory",
    dateFlag: "notmandatory"
  },

  hundredtwenty: {
    truID: "mandatory"
  },

  hundredtwentyone: {
    referenceID: "mandatory"
  },

  hundredtwentytwo: {
    truID: "mandatory",
    transactionType: "mandatory",
    status: "mandatory",
    qty: "mandatory",
    conversionTo: "mandatory",
    conversionFrom: "mandatory",
    invoice: "mandatory",
    MOP: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },

  hundredtwentythree: {
    truID: "mandatory",
    invoice: "mandatory"
  },
  hundredtwentyfour: {
    truID: "mandatory"
  },
  hundredtwentyfive: {
    verificationCode: "mandatory"
  },
  hundredtwentysix: {
    truID: "mandatory"
  },
  hundredtwentyseven: {
    truID: "mandatory",
    referenceID: "mandatory"
  },
  hundredtwentyeight: {
    truID: "mandatory"
  },
  hundredtwentynine: {
    truID: "mandatory"
  },
  hundredthirty: {
    truID: "mandatory"
  },
  hundredthirtyone: {
    truID: "mandatory",
    skip: "mandatory",
    startDate: "notmandatory",
    dateFlag: "notmandatory"
  },
  hundredthirtytwo: {
    truID: "mandatory",
    countryCode: "mandatory"
  },
  hundredthirtythree: {
    truID: "mandatory",
    email: "mandatory"
  },
  hundredthirtyfour: {
    truID: "mandatory",
    TranID: "mandatory",
    serialNo: "mandatory",
    beneficiaryName: "mandatory"
  },
  hundredthirty_five: {
    truID: "mandatory",
  },
  hundredthirty_six: {
    truID: "mandatory",
    messageType: "mandatory",
    amount: "mandatory",
    UTRNumber: "mandatory",
    senderIFSC: "mandatory",
    senderAccountNumber: "mandatory",
    senderAccountType: "mandatory",
    senderName: "mandatory",
    beneficiaryAccountType: "mandatory",
    beneficiaryAccountNumber: "mandatory",
    creditDate: "mandatory",
    creditAccountNumber: "mandatory",
    corporateCode: "mandatory",
    clientCodeMaster: "mandatory",
    senderInformation: "mandatory",
  },
  hundredthirty_seven: {
    truID: "mandatory",
    invoice: "mandatory",
    TranID: "mandatory",
    Corp_ID: "mandatory",
    Maker_ID: "mandatory",
    Checker_ID: "mandatory",
    Approver_ID: "mandatory",
    Status: "mandatory",
    Error_Cde: "mandatory",
    Error_Desc: "mandatory",
    RefNo: "mandatory",
    Ben_Acct_No: "mandatory",
    Amount: "mandatory",
    BenIFSC: "mandatory",
    Txn_Time: "mandatory",
    tType: "mandatory"
  },

  hundredthirty_eight: {
    truID: "mandatory",
    invoice: "mandatory",
    ModeOfPay: "mandatory",
    amount: "mandatory",
    accountNo: "mandatory",
    IFSC: "mandatory"
  },

  hundredthirtyfive: {
    crnNo: "mandatory",
    houseNumber: "mandatory",
    streetNumber: "mandatory",
    landmark: "mandatory",
    pin: "mandatory",
    city: "mandatory",
    state: "mandatory",
    country: "mandatory",
    pHouseNumber: "mandatory",
    pStreetNumber: "mandatory",
    pLandmark: "mandatory",
    pPin: "mandatory",
    pCity: "mandatory",
    pState: "mandatory",
    pCountry: "mandatory"
  },
  hundredthirtysix: {
    crnNo: "mandatory",
    newPassword: "mandatory",
    oldPassword: "mandatory"
  },
  hundredthirtyeight: {
    crnNo: "mandatory",
    image: "mandatory"
  },
  hundredthirtyseven: {
    mobile: "mandatory",
    newPassword: "mandatory",
    otp: "mandatory",
  },
  hundredthirtynine: {
    crnNo: "mandatory",
    kycDetails: "mandatory",
    flag: "mandatory"
  },


  hundredthirtyten: {
    crnno: "mandatory",
    toCrnno: "mandatory",
    nickName: "notmandatory"
  },

  hundredthirtyeleven: {
    crnno: "mandatory"
  },


  hundredthirtyTwelve: {
    crnno: "mandatory",
    toCrnno: "mandatory"
  },
  hundredthirtyThirteen: {
    crnno: "mandatory",
    toCrnno: "mandatory",
    isfav: "mandatory"
  },
  hundredthirtyfourteen: {
    skip: "mandatory",
    CRNNo: "mandatory"
  },
  hundredthirtyfifteen: {
    notificationID: "mandatory",
    isRead: "mandatory",
    toCRNNo: "mandatory"
  },

  threehundredeighteen: {
    CRNNo: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory",
    PGType: "notmandatory",
  },
  threehundrednineteen: {
    CRNNo: "mandatory",
    dCRNNo: "mandatory",
    rate: "mandatory",
    quantity: "notmandatory",
    assetmanagerName: "mandatory",
    bullionType: "mandatory",
    type: "mandatory",
    amount: "notmandatory"
  },

  threehundredtwenty: {
    CRNNo: "mandatory"
  },

  threehundredtwentyone: {
    CRNNo: "mandatory"
  },

  threehundredtwentytwo: {
    CRNNo: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },
  threehundredtwentythree: {
    CRNNo: "mandatory"
  },
  threehundredtwentyfour: {
    CRNNo: "mandatory",
    skip: "mandatory",
    startDate: "notmandatory",
    dateFlag: "notmandatory"
  },

  threehundredtwentyfive: {
    flag: "notmandatory",
    countryCode: "mandatory"
  },


  threehundredThirtySix: {
    CRNNo: "mandatory"
  },
  threehundredtwentysix: {
    CRNNo: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory"
  },
  threehundredtwentyseven: {
    CRNNo: "mandatory",
    G24K: "mandatory",
    S99P: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    isassetmanager: "mandatory",
    PGType: "notmandatory"
  },
  threehundredtwentyeight: {
    CRNNo: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory"
  },
  threehundredtwentynine: {
    CRNNo: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },
  threehundredthirty: {
    toCRNNo: "mandatory",
    fromCRNNo: "mandatory",
    fromName: "mandatory",
    G24qty: "mandatory",
    
    
    S99qty: "mandatory",
    transactionType: "mandatory",
    MOP: "mandatory",
    status: "mandatory",
    invoice: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },
  threehundredthirtyone: {
    CRNNo: "mandatory",
    transactionType: "mandatory",
    status: "mandatory",
    qty: "mandatory",
    conversionTo: "mandatory",
    conversionFrom: "mandatory",
    invoice: "mandatory",
    MOP: "mandatory",
    aStatus: "mandatory",
    PGType: "notmandatory"
  },
  threehundredthirtytwo: {
    CRNNo: "mandatory",
    invoice: "mandatory",
    amount: "mandatory"
  },
  threehundredthirtythree: {
    CRNNo: "mandatory",
    startDate: "notmandatory",
    endDate: "notmandatory",
    dateFlag: "notmandatory"
  },
  hundredfourtythree: {
    truID: "mandatory",
    OTP: "mandatory"
  },
  hundredfourtyeight: {
    CRNNo: "mandatory",
    invoice: "mandatory",
    type: "mandatory"
  },
  hundredfifty: {
    truID: "mandatory",
    rTruID: "mandatory",
    creditID: "mandatory",
    amount: "mandatory",
    txnNote: "mandatory",
    tType: "mandatory"
  },
  hundredfiftyfour: {
    truID: "mandatory",
    creditID: "mandatory"
  },
  hundredsixtyone: {
    mobile: "mandatory",
    partnerHandle: "mandatory",
    fname: "mandatory",
    lname: "mandatory",
  },
  hundredseventyTwo: {
    truID: "mandatory",
    amount: "mandatory",
    appliedOn: "mandatory",
    pgType: "mandatory",
  }
}
