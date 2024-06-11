var $form1 = $("#imageUploadForm1"),
  $file1 = $("#file1"),
  $uploadedImg1 = $("#uploadedImg1"),
  $helpText1 = $("#helpText1");

var $formZ = $("#imageUploadForm"),
  $file = $("#file"),
  $uploadedImg = $("#uploadedImg"),
  $helpText = $("#helpText");

var $form2 = $("#imageUploadForm2"),
  $file2 = $("#file2"),
  $uploadedImg2 = $("#uploadedImg2"),
  $helpText2 = $("#helpText2");

function readURL(input, type) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    if (type === "aadhaarfront") {
      reader.onload = function (e) {
        $uploadedImg[0].style.backgroundImage = 'url(' + e.target.result + ')';
      };
      $formZ.addClass('loading');

    } else if (type === "aadhaarback") {
      reader.onload = function (e) {
        $uploadedImg1[0].style.backgroundImage = 'url(' + e.target.result + ')';
      };
      $form1.addClass('loading');
    } else if (type === "pan") {
      reader.onload = function (e) {
        $uploadedImg2[0].style.backgroundImage = 'url(' + e.target.result + ')';
      };
      $form2.addClass('loading');
    }
    reader.readAsDataURL(input.files[0]);
  }
}


$('INPUT[type="file"]').change(function () {
  const filename = this.value;
  const lastDot = filename.lastIndexOf('.');
  const ext = filename.substring(lastDot + 1);
  var uploadval = $(this).attr('data-type');
  switch (ext) {
    case 'jpg':
    case 'png':
    case 'jpeg':
    case 'PNG':
    case 'pdf':
    case 'PDF':
    case 'JPG':
    case 'gif':
    case 'doc':
    case 'docx':
    case 'DOC':
    case 'DOCX':
      break;
    default:
      WarnMsg("", "Please upload file having extensions .jpg/.jpeg/.pdf/.doc/.docx only...!!");
      this.value = '';
  }
  var f = this.files[0]
  //here I CHECK if the FILE SIZE is bigger than 8 MB (numbers below are in bytes)
  if (f.size > 1048576 || f.fileSize > 1048576) {
    //show an alert to the user
    //  alert("Allowed file size exceeded. (Max. 8 MB)")

    //reset file upload control
    this.value = null;
    this.value = '';
    WarnMsg("Consumer", "File must be less than 1MB");
    return false;
  }
  readURL(this, uploadval);
});
// $file.on('change', function () {
//   readURL(this, "aadhaarfront");
//   $form.addClass('loading');
// });
// $uploadedImg.on('webkitAnimationEnd MSAnimationEnd oAnimationEnd animationend', function () {
//   $form.addClass('loaded');
// });


// $file1.on('change', function () {
//   readURL(this, "aadhaarback");
//   $form1.addClass('loading');
// });
// $uploadedImg1.on('webkitAnimationEnd MSAnimationEnd oAnimationEnd animationend', function () {
//   $form1.addClass('loaded');
// });