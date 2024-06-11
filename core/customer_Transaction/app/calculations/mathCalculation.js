const { create, all } = require('mathjs')

// configure the default type of numbers as BigNumbers
const config = {
    // Default type of number
    // Available options: 'number' (default), 'BigNumber', or 'Fraction'
    number: 'BigNumber',

    // Number of significant digits for BigNumbers
    precision: 20
}
const math = create(all, config)

module.exports.truaddition = function (obj, result) {
    print(math.add(math.bignumber(0.1), math.bignumber(0.2))) // BigNumber, 0.3
    print(math.divide(math.bignumber(0.3), math.bignumber(0.2))) // BigNumber, 1.5
    result;
}
module.exports.trusumation = function (obj, result) {
    print(math.add(math.bignumber(0.1), math.bignumber(0.2))) // BigNumber, 0.3
    result;
}
module.exports.trumultiplication = function (x, y, result) {
    var var1 = parseFloat(x);
    var var2 = parseFloat(y);

    var var3 = math.multiply(math.bignumber(var1), math.bignumber(var2))

    result(var3);
}
module.exports.trudivide = function (obj, result) {
    var var1 = parseFloat(x);
    var var2 = parseFloat(y);

    result(math.divide(math.bignumber(var1), math.bignumber(var2)));
}






