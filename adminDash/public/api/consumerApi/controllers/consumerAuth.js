// author : Suresh Patil
// date : 24-04-2019
// Description : Consumer Authentication
 
accData = [] 
function displayAllDealTable() {
  // console.log('Ans  = '+ $.fn.dataTable.isDataTable('#example'));
  if ($.fn.dataTable.isDataTable('#example')) { 
    table.clear(); 
    table.rows.add(accData); 
    table.draw();
  }
  else { 
    table = $('#example').DataTable({
      'paging': true,
      'lengthChange': true,
      'searching': true,
      'ordering': true,
      'info': true,
      'scrollX': true,


      data: accData, // PASS ARRAY TO HERE

      columns: [
        { title: "Profile Image" },
        { title: "TruID" },
        { title: "Mobile" },
        { title: "Email Id" },
        { title: "Address" },
        { title: "AssetStore Name" },
        { title: "Status" },
        { title: "Activity" }

      ]
    });
    //table.buttons().container().add('#example_wrapper .Dcol-md-6:eq(0)');


  }

}


accData = new Array();
$(".dtable").hide();
$(".ntable").hide();
$('.node').hide();
$('.deal').hide();
$(".alldtable").show();
$('.searchStock').hide();
$('#cancel').show();
assetmanager_det = all_obj.resource;
accData = new Array();
for (var i = 0; i < assetmanager_det.length; i++) { 
  truId = assetmanager_det[i].assetmanager_truId;
  name = assetmanager_det[i].assetmanager_name;
  profileImg = "<img src='dist/img/avatar3.png' style='padding:0px; width:50px; height:50px;' alt='image' class='center img-circle'>";
  truID = assetmanager_det[i].truID;
  mobile = assetmanager_det[i].mobile;
  email = assetmanager_det[i].email;
  address = assetmanager_det[i].address;
  custdName = assetmanager_det[i].custdName;
  // "<div class=''><div class='btn-group' data-toggle='buttons'>"+
  // "<label class='btn btn-outline-primary waves-effect waves-light btn-sm active'>"+
  // "<input type='radio' name='options' id='option1' autocomplete='off' checked> Gold</label>"+
  // "<label class='btn btn-outline-primary waves-effect waves-light btn-sm'>"+
  // "<input type='radio' name='options' id='option2' autocomplete='off'> Silver</label></div></div>"
  status = '<td><div class="mini-stat-info ">' +
    '<p class="mt-0 header-title">Account status : ' + '<button type="button" class="btn btn-info waves-effect waves-light" style="padding: 4px;">' + 'Enabled' + '</button></p>' +
    '</div></td>';
  act = ' <td>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown">Action' +
    '<span class="caret"></span></button>' +
    '<ul class="dropdown-menu">' +
    '   <li><a href="#">View user</a></li>' +
    '<li><a href="#">Edit user</a></li>' +
    '<li><a href="#">Change Password</a></li>' +
    '<li><a href="#">Inactive</a></li>' +
    '<li><a href="#">Delete user</a></li>' +
    '<li><a href="#">View Permissions</a></li>' +
    '<li><a href="#">Send mail</a></li>' +
    '<ul class="divider"></ul>' +
    '<li><a href="#">Block user</a></li>';

  data = [profileImg, truID, mobile, email, address, custdName, status, act]
  accData.push(data)
}  
displayAllDealTable();

$(document).ready(function () {
 // console.log('Ready');
})
