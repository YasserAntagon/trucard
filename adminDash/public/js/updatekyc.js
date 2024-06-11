// author : nikhil bharambe
// date : 05-06-2018
//update KYC

$(document).ready(function () 
{
    $('.radio-group label').on('click', function()
{
    $(this).removeClass('not-active').siblings().addClass('not-active');
});
$("#fname").focus();
$(".cop").hide();
$(".cod").hide();
$('#cmbCType').change(function () {
var category= $('select[name=compType]').val();
if(category=='llp')
{
$(".cop").show();
$(".cod").show();
}
else if(category=='opc')
{
    $(".cop").hide();
    $(".cod").show();
}
else if(category=='sole')
{
    $(".cop").show();
    $(".cod").show();
}
else if(category=='pvt')
{
    $(".cop").hide();
    $(".cod").show();
}else if(category=='pship')
{
    $(".cod").hide();
    $(".cop").show();
}
else if(category=='pl')
{
    $(".cop").show();
    $(".cod").show();
}
else
{
    $(".cop").hide();
    $(".cod").hide();
}
});

$('.radio-group label').on('click', function()
{
    if($('#txtLNo').is(':disabled'))
    {
     
    }
    else
    {
        $(this).removeClass('not-active').siblings().addClass('not-active');
    }
});

    //Date picker
    $('input[name="dob"]').datepicker({
        autoclose: true,
        format: 'dd/mm/yyyy'
    })

    $('#txtpincode').change(function () {
        var fnname = $(this).val();
        $.getJSON('json/pincode.json', function (data) {
            //  console.log(data);               
            $.each(data, function (i, val)
            {
               if (val.pincode==fnname) 
                {
                    $("#city").val(val.city);
                    $("#state").val(val.state);
                    $("#country").val("India");
                    return;
                }
            });
        });
    });

    $('#bpincode').change(function () {
        if ($(this).val().length == 6)
        {
            var fnname = $(this).val();
            $.getJSON('json/pincode.json', function (data) {
                //  console.log(data);               
                $.each(data, function (i, val)
                {
                    if (val.pincode==fnname)
                    {
                        $("#bcity").val(val.city);
                        $("#bstate").val(val.state);
                        $("#bcountry").val("India");
                        return;
                    }
                });
            });
        } 
        else
        {
            // clear state,country,city field
        }
    });
});
$('#btnReset').click(function () {  // submit button event
    $(this).closest('form').find("input[type=text], textarea").val("");
});

$('#btnUpload').click(function () {
    $('.progress').show();

    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            $('.progress-bar').css('width', width + "%");
            $('.progress-bar').text(width + "%");
        }
    }
});

// same as permanant address
$("input[name='reg']").change(function () {    
    var radioValue = $(this).val();
    if(radioValue=='True')
    {
        $('#p_add1').val($('#b_add1').val());
        $('#p_street').val($('#b_street').val());
        $('#p_landamark').val($('#b_landamark').val());
        $('#txtpincode').val($('#bpincode').val());
        $('#state').val($('#bstate').val());
        $('#city').val($('#bcity').val());
        $('#country').val($('#bcountry').val());
       
    } else {
        $('#p_add1').val('');
        $('#p_landamark').val("");
        $('#p_street').val('');
        $('#txtpincode').val("");
        $('#state').val("");
        $('#city').val("");
        $('#country').val("");
    }
});

// same as permanant address
$("input[name='agg']").change(function () {    
    var radioValue = $(this).val();
    if(radioValue=='True')
    {
        $('#cp_add1').val($('#b_add1').val());
        $('#cp_street').val($('#b_street').val());
        $('#cp_landamark').val($('#b_landamark').val());
        $('#txtcpincode').val($('#bpincode').val());
        $('#cstate').val($('#bstate').val());
        $('#ccity').val($('#bcity').val());
        $('#ccountry').val($('#bcountry').val());

    } else {
        $('#cp_add1').val('');
        $('#cp_landamark').val("");
        $('#cp_street').val('');
        $('#txtcpincode').val("");
        $('#cstate').val("");
        $('#ccity').val("");
        $('#ccountry').val("");
    }
});
// Company Operators
var counter = 1;
var nextMaxp = 10;
function kycCopUpload()
{
    var div = "<div class='row abc" + counter + "'><div class='col-xs-12 col-sm-6 col-md-4' id='tmp" + counter + "'><div class='form-group'> <div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-cards'></span> </span> <select type='text' class='form-control subdmitId' name='subdmitId[]' required id='subdmitId'"+counter+"' placeholder=''><option>Electricity Bill</option><option>PAN card</option><option>Shop n establishment [Gumasta] Number</option><option>BIS License for HAlMARK</option><option>VAT Number</option><option>CST Number</option><option>GST Number</option><option>Property Ownership</option><option>Insurance</option><option>Other</option></select></div></div></div><div class='col-xs-12 col-sm-6 col-md-4'><div class='form-group'><div class='input-group'> <span class='input-group-addon'> <span class='mdi mdi-file-document'></span> </span><input type='text' class='form-control kycdocnum' maxlength='20' name='kycdocnum[]' required id='kycdocnum" + counter + "' placeholder='Enter your document number'/></div></div></div><div class='col-xs-12 col-sm-6 col-md-3'><div class='form-group'><div class='input-group'> <input id='file" + counter + "' name='file[]" + counter + "' type='file' class='form-control kycdoc' /> </div></div></div><div class='col-xs-12 col-sm-6 col-md-1'> <div class='form-group' id='kycadd'" + counter + "><a href='javascript:void(0);' class='btn btn-info mdi mdi-delete btnkycRemove'  id=" + counter + " ></a></div></div></div>";
    $('.moreupload').append(div);
    counter++;
}
$(document).on('click', '.btnkycRemove', function (e)
{
    e.preventDefault();
    var count = $(this).attr("id");
    $(".abc" + count).remove();
    counter=counter-1;
});

$(document).on('click', '.btnkycAdd', function ()
{
    if(counter===nextMaxp)
    {
      WarnMsg("Company Admin","only "+nextMaxp+" document uploded..!!");   
      return false;
    }
    else
    {
       kycCopUpload();
    }
});

