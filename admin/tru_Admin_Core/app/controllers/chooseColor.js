function chooseColor(expr) {
    var str = typeof (expr) == "string" ? expr : expr.toString();
    var color = "";
    switch (str) {
        case 'Direct':
            color = "#003443";
            break;
        case 'false':
            color = "#8803fc";
            break;
        default:
            color = "#ff8c00";
    }
    return color;

}
module.exports=chooseColor