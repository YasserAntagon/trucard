db = connect('mongodb://127.0.0.1:27017/truassetstore');
db.kycs.insertOne({
    "latitudeLongitude": [72.83008, 18.92493],
    "status": "active",
    "agreementStatus": true,
    "assetstoreAgreement": true,
    "assetstoreAgreementStatus": true,
    "isParent": true,
    "__t": "KycAll",
    "depositesExp": ISODate("2018-11-22T14:35:57.907+05:30"),
    "kycDetails": [],
    "email": "assetstore@mcfsl.biz",
    "mobile": "7016458320",
    "contactFName": "Manoj",
    "contactMName": "K",
    "contactLName": "Kumar",
    "companyName": "KSML Bank Ltd",
    "parentTruID": "7000123455639865",
    "crnNo": "C96OPLKG",
    "truID": "7000123455639865",
    "createDate": "Thu Nov 22 2018 10:05:57 GMT+0100 (Central European Standard Time)",
    "createUser": "User",
    "__v": 0,
    "image": "7000123455639865.png",
    "companyOperationAddress": {
        "houseNumber": "KSML Bank Ltd.",
        "streetNumber": "Cuffe Parade, Colaba",
        "landmark": "KSML Tower, WTC Complex,",
        "pin": "400005",
        "city": "Mumbai",
        "state": "Maharastra",
        "country": "India"
    },
    "companyRegisteredAddress": {
        "houseNumber": "KSML Bank Ltd.",
        "streetNumber": "Cuffe Parade, Colaba",
        "landmark": "KSML Tower, WTC Complex,",
        "pin": "400005",
        "location": {
            "type": "Point",
            "coordinates": [72.83008, 18.92493]
        },
        "city": "Mumbai",
        "state": "Maharastra",
        "country": "India"
    },
    "contactAddress": {
        "houseNumber": "KSML Bank Ltd.",
        "streetNumber": "Cuffe Parade, Colaba",
        "landmark": "KSML Tower, WTC Complex,",
        "pin": "400005",
        "city": "Mumbai",
        "state": "Maharastra",
        "country": "India"
    },
    "landLine": "0216565566565",
    "type": "admin"
})