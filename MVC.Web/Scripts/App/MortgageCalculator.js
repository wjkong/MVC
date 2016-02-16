$(function () {
    var mortgageAmt = $('#txtMortgageAmt');
    var interestRate = $('#txtInterestRate');
    var paymentFrequency = $('#ddlPaymentFrequency');
    var amortizationPeriod = $('#ddlAmortizationPeriod');
    var paymentAmtRow = $('#divPaymentAmt');

    paymentAmtRow.hide();

    for (var i = 1; i <= 30; i++) {
        var text = i + " year";
        var option = new Option(i, i);
        $(option).html(text);
        $('#ddlAmortizationPeriod').append(option);
    }

    amortizationPeriod.val(5);

    $('#btnCalculate').click(function (evt) {
        //        $('.page-header').hide();
        $('.page-header-xs').hide().removeClass('visible-xs');
        if ($(this).text() == 'Calculate') {
            var rate = (interestRate.val().length == 0 || isNaN(interestRate.val())) ? zero : interestRate.val();

            if (rate == 0)
                interestRate.val(zero)

            var mortgageAmount = (mortgageAmt.val().length == 0 || isNaN(mortgageAmt.val())) ? zero : mortgageAmt.val();

            if (mortgageAmount == 0) {
                return false;
            }

            $(this).text("Startover");

            $('#txtMortgageAmt, #txtInterestRate, #ddlPaymentFrequency, #ddlAmortizationPeriod').attr('disabled', 'true');

            paymentAmtRow.show();

            var paymentAmtPerPeriod = CalculatePayment(mortgageAmount, rate, amortizationPeriod.val(), paymentFrequency.val());

            var result = "For a {0} year mortgage for {1} at the rate of {2}%, your {3} payment is: {4}.";

            paymentAmtRow.html(result.format(amortizationPeriod.val(), FormatCurrency(mortgageAmount), interestRate.val(), $('#ddlPaymentFrequency option:selected').text().toLowerCase(), FormatCurrency(paymentAmtPerPeriod)));

            Compare();

            mortgageAmt.val(FormatCurrency(mortgageAmt.val()));
        }
        else {
            $(this).text("Calculate");
            $('#txtMortgageAmt, #txtInterestRate, #ddlPaymentFrequency, #ddlAmortizationPeriod').removeAttr('disabled');
            mortgageAmt.val(mortgageAmt.val().formatNumber());
            paymentAmtRow.hide();
        }
    }); // end btnCalculate click event

    function Compare() {
        var str = [];
        var columnTitle = ["Payment Frequency", "Payment", "Monthly Payment", "Total Payment", "Cost of Borrow", "Save Money"];
        var freqName = ["Monthly", "Semi-monthly", "Bi-weekly", "Weekly"];
        var hiddenColumn = ["Cost of Borrow", "Save Money"]
        var freq = [12, 24, 26, 52];

        str.push("<table class='table table-striped'>");
        str.push("<tr>");

        $.each(columnTitle, function (index, value) {
            if ($.inArray(value, hiddenColumn) >= 0) {
                str.push("<th class=hidden-xs>", value, "</th>");
            }
            else
                str.push("<th>", value, "</th>");
        });

        str.push("</tr>");

        var monthlyCostOfBorrow;

        $.each(freq, function (index, value) {

            var paymentPerPeriod = CalculatePayment(mortgageAmt.val(), interestRate.val(), amortizationPeriod.val(), value);
            var monthlyPayment = CalculateMonthlyPayment(paymentPerPeriod, value);
            var totalPayment = CalculateTotalPayment(paymentPerPeriod, amortizationPeriod.val(), value);
            var costOfBorrow = CalculateCostOfBorrow(mortgageAmt.val(), totalPayment);

            if (value == 12)
                monthlyCostOfBorrow = costOfBorrow;

            if (paymentFrequency.val() == value)
                str.push("<tr class=success>");
            else
                str.push("<tr>");

            if (value == 28 || value == 56)
                str.push("<td>", "<span class=text-info>*</span> " + freqName[index], "</td>");
            else
                str.push("<td>", freqName[index], "</td>");

            str.push("<td>", FormatCurrency(paymentPerPeriod), "</td>");
            str.push("<td>", FormatCurrency(monthlyPayment), "</td>");
            str.push("<td>", FormatCurrency(totalPayment), "</td>");
            str.push("<td class=hidden-xs>", FormatCurrency(costOfBorrow), "</td>");
            str.push("<td class=hidden-xs>", FormatCurrency(monthlyCostOfBorrow - costOfBorrow), "</td>");
            str.push("</tr>");
        });

        //                var infomation = "* Accelerated payment method pay back more amount of money each period; therefore, the outstanding principal reduce faster and interest cost less";

        //                str.push("<tfoot><tr><td colspan=6 class='text-info'><small>", infomation, "</small></td></tr></tfoot>");
        str.push("</table>");

        $('#detail').html(str.join(emptyStr));
    }

});                 // end ready


function CalculatePayment(principal, interest, amortization, frequency) {
    var paymentPerPeriod = 0.00;
    var extraPaymentPerPeriod = 0.00;

    if (frequency == 28 || frequency == 56) {
        var monthlyPaymentAmt = CalculatePayment(principal, interest, amortization, 12);

        frequency = frequency == 28 ? 26 : 52;

        extraPaymentPerPeriod = monthlyPaymentAmt / frequency;
    }

    interest = interest / (frequency * 100);
    amortization = amortization * frequency;

    if (interest == 0)
        paymentPerPeriod = principal / amortization;
    else
        paymentPerPeriod = (principal * interest) / (1 - Math.pow(1 + interest, -amortization));

    paymentPerPeriod += extraPaymentPerPeriod;
    paymentPerPeriod = paymentPerPeriod;

    return paymentPerPeriod;
}

function CalculateMonthlyPayment(paymentPerPeriod, paymentFrequency) {
    var monthlyPayment = 0.00;

    if (paymentFrequency == 28)
        paymentFrequency = 26;
    else if (paymentFrequency == 56)
        paymentFrequency = 52;

    monthlyPayment = paymentPerPeriod * paymentFrequency / 12;
    monthlyPayment = monthlyPayment;

    return monthlyPayment
}

function CalculateTotalPayment(paymentPerPeriod, amortization, paymentFrequency) {
    var totalPayment = 0.00;

    if (paymentFrequency == 28)
        paymentFrequency = 26;
    else if (paymentFrequency == 56)
        paymentFrequency = 52;

    totalPayment = paymentPerPeriod * amortization * paymentFrequency;
    totalPayment = totalPayment;

    return totalPayment
}

function CalculateCostOfBorrow(principal, totalPayment) {
    var costOfBorrow = 0.00;

    costOfBorrow = totalPayment - principal;
    costOfBorrow = costOfBorrow;

    return costOfBorrow;
}