db = connect( 'mongodb://127.0.0.1:27017/truassetmanager');
db.kycs.insertOne({
    "gender": "male",
    "countryCode":"+91",
    "aboutMe": "",
    "latitudeLongitude": ["0","0"],
    "bullionType": "both", 
    "KYCFlag": "active",
    "isParent": true,
    "__t": "KycAll",
    "DOB": ISODate("2000-11-26T19:57:09.064+05:30"),
    "companyOperationAddress": {
        "city": "New Delhi",
        "country": "India",
        "houseNumber": "203 dohil chambers",
        "landmark": "46 nehru place",
        "pin": "110019",
        "state": "DELHI",
        "streetNumber": "nehru place"
    },
    "companyRegisteredAddress": {
        "city": "New Delhi",
        "country": "India",
        "houseNumber": "203 dohil chambers",
        "landmark": "46 nehru place",
        "pin": "110019",
        "state": "DELHI",
        "streetNumber": "nehru place"
    },
    "contactAddress": {
        "city": "New Delhi",
        "country": "India",
        "houseNumber": "203 dohil chambers",
        "landmark": "46 nehru place",
        "location": {
            "type": "Point",
            "coordinates": [0, 0]
        },
        "pin": "110019",
        "state": "DELHI",
        "streetNumber": "nehru place"
    },
    "email": "assetmanager@mcfsl.biz",
    "assetmanagerName": "MCFSL",
    "mobile": "9876543210",
    "contactFName": "Anuj",
    "contactMName": "Manohar",
    "contactLName": "Gupta ",
    "companyName": "MCFSL",
    "truID": "6000359854095411",
    "CRNNo": "dPMDJKS7",
    "createDate": ISODate("2024-04-03T14:12:12.127+05:30"),
    "createUser": "User",
    "parentTruID": "6000359854095411",
    "__v": 0,
    "currentassetstore": "7000123455639865"
})