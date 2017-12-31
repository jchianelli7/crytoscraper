/*
cd ..js/nm
node index.js arg0
*/
/*
equation: an array containing the coefficients of the equation
string: A string representation of the equation
points: an array containing the predicted data in the domain of the input
r2: the coefficient of determination (R2)
predict(x): This function will return the predicted value
-------
regression.linear(data[, options])
regression.exponential(data[, options])
regression.logarithmic(data[, options])
regression.power(data[, options])
regression.polynomial(data[, options])
*/

var regression = require('regression')
var jquery = require('jquery');
var Nightmare = require('nightmare'),
    nightmare = Nightmare()

var coin = process.argv[2]

var url;
if (coin == undefined)
    url = 'https://coinmarketcap.com/currencies/bitcoin/historical-data/';
else
    url = 'https://coinmarketcap.com/currencies/' + coin + '/historical-data/';
nightmare.goto(url)
    .wait(2000)
    .evaluate(function () {
        var data = [];
        $("table").each(function () {
            var table = $(this);
            var dayCount = 30;
            table.find("tr").each(function () {
                var tableRow = $(this);
                var day = {}
                var i = 0;
                tableRow.find("td").each(function () {
                    day["day"] = dayCount;
                    switch (i) {
                        case 0:
                            day["date"] = $(this).text();
                            break;
                        case 1:
                            day["open"] = $(this).text();
                            break;
                        case 2:
                            day["high"] = $(this).text();
                            break;
                        case 3:
                            day["low"] = $(this).text();
                            break;
                        case 4:
                            day["close"] = $(this).text();
                            break;
                        case 5:
                            day["volume"] = $(this).text();
                            break;
                        case 6:
                            day["market_cap"] = $(this).text();
                            break;
                    }
                    i++;
                    if (i == 7)
                        i = 0;
                });
                data.push(day)
                dayCount--;
            });
        });
        data.reverse();
        return data;
    })
    .end()
    .then(function (result) {
        //i.e result[data].close
        var dataSet = [];
        for (data in result) {
            var x = result[data].day;
            var y = result[data].close;
            if (y != undefined) {
                y = y.replace(/\,/g, '');
                y = parseFloat(y);
                dataSet.push([x, y]);
            }
        }


        //console.log(dataSet);
        const dataResult = regression.polynomial(dataSet, {order: 3});
        console.log("Polynomial Regression Curve Eqn: " + dataResult.string);
        for(var i=30; i<38; i++){}
        console.log("Next 7 days:\n" + dataResult.predict(30)+"\n"+ dataResult.predict(31)+"\n"+ dataResult.predict(32)+"\n"
            + dataResult.predict(33)+"\n"+ dataResult.predict(34)+"\n"+ dataResult.predict(35)+"\n"+ dataResult.predict(36)+"\n"
            + dataResult.predict(37));

    })


