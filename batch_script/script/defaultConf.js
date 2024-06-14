db = connect('mongodb://127.0.0.1:27017/truCommon');
db.permissions.insertMany([{
	"module": {
		"buy": {
			"status": "allow",
			"message": ""
		},
		"redeemCash": {
			"status": "allow",
			"message": ""
		},
		"transfer": {
			"status": "allow",
			"message": ""
		},
		"redeemToBank": {
			"status": "allow",
			"message": ""
		},

		"linkbank": {
			"status": "allow",
			"message": ""
		},
		"redeemToWallet": {
			"status": "allow",
			"message": ""
		}
	},
	"limit": {
		"home": {
			"message": "allow",
			"status": "allow"
		}
	},
	"limitSelf": {
		"home": {
			"message": "allow",
			"status": "allow"
		},
		"buy": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("100000"),
			"maxAmtOfTxnInHour": Decimal128("100000"),
			"maxAmtOfTxnInMonth": Decimal128("100000"),
			"noOfTxnInInterval": Decimal128("1"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},
		"redeemCash": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("100000"),
			"maxAmtOfTxnInHour": Decimal128("100000"),
			"maxAmtOfTxnInMonth": Decimal128("100000"),
			"noOfTxnInInterval": Decimal128("1"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},

		"transfer": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("100000"),
			"maxAmtOfTxnInHour": Decimal128("100000"),
			"maxAmtOfTxnInMonth": Decimal128("100000"),
			"noOfTxnInInterval": Decimal128("1"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},
		"wallet": {
			"bulContainLimit": Decimal128("0"),
			"max": Decimal128("100000"),
			"maxAmtOfTxnInDay": Decimal128("10000000"),
			"maxAmtOfTxnInHour": Decimal128("10000000"),
			"maxAmtOfTxnInMonth": Decimal128("10000000"),
			"min": Decimal128("10"),
			"noOfTxnInInterval": Decimal128("2"),
			"txnInterval": Decimal128("60"),
			"walletLimit": Decimal128("10000000")
		},
		"walletToBank": {
			"maxAmtOfTxnInDay": Decimal128("100000"),
			"maxAmtOfTxnInHour": Decimal128("100000"),
			"maxAmtOfTxnInMonth": Decimal128("100000"),
			"noOfTxnInInterval": Decimal128("1"),
			"txnInterval": Decimal128("60"),
			"wtbmax": Decimal128("100000"),
			"wtbmin": Decimal128("25")
		},
	},
	"digitalPayment": {
		"atom": "allow",
		"bank": "allow",
		"isIMPS": "allow",
		"isNEFT": "allow"
	},
	"truID": "1000978540015804",
	"KYCFlag": "KYC",
	"appliedOn": "entity",
	"createDate": ISODate("2022-08-22T14:19:33.000+05:30"),
	"modifyDate": ISODate("2024-03-20T15:08:51.558+05:30"),
	"moduleSelf": {
		"nodeAccess": {
			"status": "allow",
			"message": ""
		},
		"buy": {
			"status": "allow",
			"message": ""
		},
		"consumerAccess": {
			"status": "allow",
			"message": ""
		},
		"linkbank": {
			"status": "allow",
			"message": ""
		},
		"login": {
			"status": "allow",
			"message": ""
		},
		"redeemCash": {
			"status": "allow",
			"message": ""
		},
		"redeemToBank": {
			"status": "allow",
			"message": ""
		},
		"transfer": {
			"status": "allow",
			"message": ""
		},
		"walletAccess": {
			"status": "allow",
			"message": ""
		},
		"walletToBank": {
			"status": "allow",
			"message": ""
		},
		"redeemToWallet": {
			"status": "allow",
			"message": ""
		},
		"payByWallet": {
			"status": "allow",
			"message": ""
		}
	},
	"bankSlab": [
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("25000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("5"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061cf")
		},
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("250000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("9"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061d5")
		}
	]
},
{
	"module": {
		"buy": {
			"status": "allow",
			"message": ""
		},
		"redeemCash": {
			"status": "allow",
			"message": ""
		},
		"transfer": {
			"status": "allow",
			"message": ""
		},
		"redeemToBank": {
			"status": "allow",
			"message": ""
		},
		"login": {
			"status": "allow",
			"message": ""
		},
		"linkbank": {
			"status": "allow",
			"message": ""
		},
		"payByWallet": {
			"status": "allow",
			"message": ""
		},
		"walletAccess": {
			"status": "allow",
			"message": ""
		},
		"walletToBank": {
			"status": "allow",
			"message": ""
		},
		"redeemToWallet": {
			"status": "allow",
			"message": ""
		}
	},
	"limit": {
		"home": {
			"message": "allow",
			"status": "allow"
		},
		"buy": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("10000000"),
			"maxAmtOfTxnInHour": Decimal128("10000000"),
			"maxAmtOfTxnInMonth": Decimal128("10000000"),
			"noOfTxnInInterval": Decimal128("5"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},
		"redeemCash": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("1000000"),
			"maxAmtOfTxnInHour": Decimal128("10000000"),
			"maxAmtOfTxnInMonth": Decimal128("10000000"),
			"minBuyToSell": Decimal128("0"),
			"noOfTxnInInterval": Decimal128("1"),
			"sellAfterBuyInterval": Decimal128("60"),
			"sellToBankInterval": Decimal128("3600"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},
		"transfer": {
			"goldMax": Decimal128("100000"),
			"goldMin": Decimal128("10"),
			"maxAmtOfTxnInDay": Decimal128("1000000"),
			"maxAmtOfTxnInHour": Decimal128("1000000"),
			"maxAmtOfTxnInMonth": Decimal128("1000000"),
			"noOfTxnInInterval": Decimal128("1"),
			"silverMax": Decimal128("100000"),
			"silverMin": Decimal128("10"),
			"txnInterval": Decimal128("60")
		},
		"wallet": {
			"bulContainLimit": Decimal128("0"),
			"max": Decimal128("1000000"),
			"maxAmtOfTxnInDay": Decimal128("1000000"),
			"maxAmtOfTxnInHour": Decimal128("1000000"),
			"maxAmtOfTxnInMonth": Decimal128("1000000"),
			"min": Decimal128("1"),
			"noOfTxnInInterval": Decimal128("1"),
			"txnInterval": Decimal128("60"),
			"walletLimit": Decimal128("10000000000")
		},
		"walletToBank": {
			"maxAmtOfTxnInDay": Decimal128("1000000"),
			"maxAmtOfTxnInHour": Decimal128("1000000"),
			"maxAmtOfTxnInMonth": Decimal128("1000000"),
			"noOfTxnInInterval": Decimal128("1"),
			"txnInterval": Decimal128("60"),
			"wtbmax": Decimal128("100000"),
			"wtbmin": Decimal128("10")
		}
	},
	"limitSelf": {
		"home": {
			"message": "allow",
			"status": "allow"
		}
	},
	"digitalPayment": {
		"atom": "allow",
		"bank": "allow",
		"isIMPS": "allow",
		"isNEFT": "allow"
	},
	"truID": "1000978540015804",
	"KYCFlag": "KYC",
	"appliedOn": "consumer",
	"createDate": ISODate("2024-04-05T16:13:39.000+05:30"),
	"modifyDate": ISODate("2024-04-05T17:46:00.446+05:30"),
	"bankSlab": [
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("25000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("5"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061cf")
		},
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("250000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("9"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061d5")
		}
	]
},
{
	"module": {
		"buy": {
			"status": "allow",
			"message": ""
		},
		"redeemCash": {
			"status": "allow",
			"message": ""
		},
		"transfer": {
			"status": "allow",
			"message": ""
		},
		"redeemToBank": {
			"status": "allow",
			"message": ""
		},
		"login": {
			"status": "allow",
			"message": ""
		},
		"linkbank": {
			"status": "allow",
			"message": ""
		},
		"walletAccess": {
			"status": "allow",
			"message": ""
		},
		"redeemToWallet": {
			"status": "allow",
			"message": ""
		}
	},
	"limit": {
		"home": {
			"message": "allow",
			"status": "allow"
		}
	},
	"limitSelf": {
		"home": {
			"message": "allow",
			"status": "allow"
		}
	},
	"digitalPayment": {
		"atom": "allow",
		"bank": "allow",
		"isIMPS": "allow",
		"isNEFT": "allow"
	},
	"truID": "1000978540015804",
	"KYCFlag": "nonKYC",
	"appliedOn": "consumer",
	"createDate": ISODate("2024-04-05T16:11:07.000+05:30"),
	"modifyDate": ISODate("2024-04-05T16:11:07.000+05:30"),
	"bankSlab": [
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("25000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("5"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061cf")
		},
		{
			"slabID": "S1713255166000",
			"PGType": "BANKPAYOUT",
			"slabAmt": Decimal128("250000"),
			"NEFTcharges": Decimal128("1.25"),
			"IMPScharges": Decimal128("9"),
			"RTGScharges": Decimal128("10"),
			"UPICharges": Decimal128("10"),
			"serviceTax": Decimal128("0.18"),
			"_id": ObjectId("661e32fe3787fe3250e061d5")
		}
	]
}])

db.digitalpayments.insertMany([{
	"KYCFlag": "KYC",
	"appliedOn": "consumer",
	"__v": 0,
	"impsPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266751000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e603fcb34ffe2fb176046")
		}
	],
	"neftPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266765000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e604dcb34ffe2fb17604c")
		}
	],
	"payIn": [
		{
			"pgID": "PG1713266669000",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e5fedcb34ffe2fb17603b")
		},
		{
			"pgID": "PG1713266725000",
			"PGType": "atom",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e6025cb34ffe2fb176040")
		}
	]
}, {
	"KYCFlag": "KYC",
	"appliedOn": "entity",
	"__v": 0,
	"impsPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266751000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e603fcb34ffe2fb176046")
		}
	],
	"neftPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266765000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e604dcb34ffe2fb17604c")
		}
	],
	"payIn": [
		{
			"pgID": "PG1713266669000",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e5fedcb34ffe2fb17603b")
		},
		{
			"pgID": "PG1713266725000",
			"PGType": "atom",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e6025cb34ffe2fb176040")
		}
	]
}, {
	"KYCFlag": "nonKYC",
	"appliedOn": "consumer",
	"__v": 0,
	"impsPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266751000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e603fcb34ffe2fb176046")
		}
	],
	"neftPayOut": [
		{
			"isDefault": true,
			"pgID": "PG1713266765000",
			"PGType": "BANKPAYOUT",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e604dcb34ffe2fb17604c")
		}
	],
	"payIn": [
		{
			"pgID": "PG1713266669000",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e5fedcb34ffe2fb17603b")
		},
		{
			"pgID": "PG1713266725000",
			"PGType": "atom",
			"status": "allow",
			"min": Decimal128("1"),
			"max": Decimal128("100000"),
			"desc": "",
			"_id": ObjectId("661e6025cb34ffe2fb176040")
		}
	]
}])