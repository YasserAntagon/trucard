ConsumerConfig.checkredeemtobankLimit(totruid, totaladd, function (limitcb, remainingtime) {
    if (limitcb === "200") {
        
    }
    else if (limitcb === "500") {
        res.json({ status: "204", message: "You have exceeded your wallet limit! Please verify your KYC for unlimited access." });
    } else if (limitcb === "400") {
        var time = remainingtime + 1;
        res.json({ status: "204", message: "Please do the next transaction after " + time + " min. This is for your transaction safety." });
    } else {
        res.json({ status: "204", message: "Something went wrong, Please try again!" });
    }
})