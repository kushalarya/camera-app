document.addEventListener('DOMContentLoaded', function () {

    // References to all the element we will need.
    var video = document.querySelector('#camera-stream'),
        image = document.querySelector('#imageMap'),
        start_camera = document.querySelector('#start-camera'),
        controls = document.querySelector('.controls'),
        take_photo_btn = document.querySelector('#take-photo'),
        delete_photo_btn = document.querySelector('#delete-photo'),
        download_photo_btn = document.querySelector('#download-photo'),
        error_message = document.querySelector('#error-message');


    var d_left, d_top;

    // The getUserMedia interface is used for handling camera input.
    // Some browsers need a prefix so here we're covering all the options
    navigator.getMedia = ( navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);


    if(!navigator.getMedia){
        displayErrorMessage("Your browser doesn't have support for the navigator.getUserMedia interface.");
    }
    else{

        // Request the camera.
        navigator.getMedia(
            {
                video: true,
                facingMode: { exact: "environment" }
            },
            // Success Callback
            function(stream){

              // const mediaStream = new MediaStream();

                // Create an object URL for the video stream and
                // set it as src of our HTLM video element.
                video.srcObject = stream;

                // Play the video element to start the stream.
                video.play();
                video.onplay = function() {
                    showVideo();
                };

            },
            // Error Callback
            function(err){
                displayErrorMessage("There was an error with accessing the camera stream: " + err.name, err);
            }
        );

    }

    $("#imageMap").click(function(e){


        var image_left = $(this).offset().left;
        var click_left = e.pageX;
        var left_distance = click_left - image_left;

        var image_top = $(this).offset().top;
        var click_top = e.pageY;
        var top_distance = click_top - image_top;

        var mapper_width = $('#mapper').width();
        var imagemap_width = $('#imageMap').width();

        var mapper_height = $('#mapper').height();
        var imagemap_height = $('#imageMap').height();



        if((top_distance + mapper_height > imagemap_height) && (left_distance + mapper_width > imagemap_width)){
          console.log( "1" );

            $('#mapper').css("left", (click_left - mapper_width - image_left  ))
            .css("top",(click_top - mapper_height - image_top  ))
            .css("width","100px")
            .css("height","100px")
            .show();
        }
        else if(left_distance + mapper_width > imagemap_width){
          console.log( "2" );

            $('#mapper').css("left", (click_left - mapper_width - image_left  ))
            .css("top",top_distance)
            .css("width","100px")
            .css("height","100px")
            .show();

        }
        else if(top_distance + mapper_height > imagemap_height){
          console.log( "3" );

            $('#mapper').css("left", left_distance)
            .css("top",(click_top - mapper_height - image_top  ))
            .css("width","100px")
            .css("height","100px")
            .show();
        }
        else{
          console.log( "4" );

          d_left = left_distance;
          d_top = top_distance;

          console.log( "Top: " + d_top + " Left: " + d_left );

            $('#mapper').css("left",left_distance)
            .css("top",top_distance)
            .css("width","100px")
            .css("height","100px")
            .show();
        }


        $("#mapper").resizable({ containment: "parent" });
        $("#mapper").draggable({ containment: "parent" });

    });



    // Mobile browsers cannot play video without user input,
    // so here we're using a button to start it manually.
    start_camera.addEventListener("click", function(e){

        e.preventDefault();

        // Start video playback manually.
        video.play();
        showVideo();

    });


    take_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        var snap = takeSnapshot();

        // Show image.
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Enable delete and save buttons
        delete_photo_btn.classList.remove("disabled");
        download_photo_btn.classList.remove("disabled");

        // Set the href attribute of the download button to the snap url.
        download_photo_btn.href = snap;

        // Pause video playback of stream.
        video.pause();

    });

    download_photo_btn.addEventListener("click", function(e) {
      // download_photo_btn.setAttribute('download', 'selfie.png');
      imageData = getBase64Image( image );
      var cordinates = new Array();
      cordinates = getCordinates();

      dataOne = {
        "image" : imageData,
        "tags" : cordinates
      };

      localStorage.setItem("data", JSON.stringify(dataOne) );


    });

    function getCordinates() {

      var cordinates = new Array();

      $(".tagged").each( function() {
        var top = $(this).css("top");
        var left = $(this).css("left");
        // var name = $(this).

        cordinates.push( { "x" : left, "y" : top, "name" : "kushalTaggedSomething" } );

      });

      return cordinates ;

    };



    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);

        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }


    delete_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();

    });



    function showVideo(){
        // Display the video stream and the controls.

        hideUI();
        video.classList.add("visible");
        controls.classList.add("visible");
    }


    function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.

        var hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        var width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }


    function displayErrorMessage(error_msg, error){
        error = error || "";
        if(error){
            console.error(error);
        }

        error_message.innerText = error_msg;

        hideUI();
        error_message.classList.add("visible");
    }


    function hideUI(){
        // Helper function for clearing the app UI.
        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        imageMap.classList.remove("visible");
        error_message.classList.remove("visible");
    }

});

// $(".tagged").live("mouseover",function(){
//     if($(this).find(".openDialog").length == 0){
//         $(this).find(".tagged_box").css("display","block");
//         $(this).css("border","5px solid #EEE");
//
//         $(this).find(".tagged_title").css("display","block");
//     }
// });

// $(".tagged").live("mouseout",function(){
//     if($(this).find(".openDialog").length == 0){
//         $(this).find(".tagged_box").css("display","none");
//         $(this).css("border","none");
//         $(this).find(".tagged_title").css("display","none");
//     }
// });

$(".tagged").live("click",function(){
    $(this).find(".tagged_box").html("<img src='del.png' class='openDialog' value='Delete' onclick='deleteTag(this)' />\n\<img src='save.png' onclick='editTag(this);' value='Save' />");

    var img_scope_top = $("#imageMap").offset().top + $("#imageMap").height() - $(this).find(".tagged_box").height();
    var img_scope_left = $("#imageMap").offset().left + $("#imageMap").width() - $(this).find(".tagged_box").width();

    $(this).draggable({ containment:[$("#imageMap").offset().left,$("#imageMap").offset().top,img_scope_left,img_scope_top]  });
});

var addTag = function(){
    var position = $('#mapper').position();

    var pos_x = position.left;
    var pos_y = position.top;
    var pos_width = $('#mapper').width();
    var pos_height = $('#mapper').height();


    $('#planetmap').append('<div class="tagged"  style="width:'+pos_width+';height:'+
        pos_height+';left:'+pos_x+';top:'+pos_y+';" ><div   class="tagged_box" style="width:'+pos_width+';height:'+
        pos_height+';display:none;" ></div><div class="tagged_title" style="top:'+(pos_height+5)+';display:none;" >'+
        $("#title").val()+'</div></div>');

    $("#mapper").hide();
    $("#title").val('');
    $("#form_panel").hide();
};

var openDialog = function(){
    $("#form_panel").fadeIn("slow");
};

var showTags = function(){
  console.log( "showTags function working" );
    $(".tagged_box").css("display","block");
    $(".tagged").css("border","5px solid #EEE");
    $(".tagged_title").css("display","block");
};

var hideTags = function(){
    $(".tagged_box").css("display","none");
    $(".tagged").css("border","none");
    $(".tagged_title").css("display","none");
};

var loadImages = function() {
  console.log("Load Images.");

  document.querySelector('#camera-stream').classList.remove("visible");
  document.querySelector('#imageMap').classList.add("visible");
  document.querySelector('.controls').classList.add("visible");


  // console.log(localStorage.getItem("data"));
  imageData = JSON.parse( localStorage.getItem("data") ).image;
  var image = document.querySelector('#imageMap')
  image.src = "data:image/png;base64," + imageData;


}

var editTag = function(obj){
    $(obj).parent().parent().draggable( 'disable' );
    $(obj).parent().parent().removeAttr( 'class' );
    $(obj).parent().parent().addClass( 'tagged' );
    $(obj).parent().parent().css("border","none");
    $(obj).parent().css("display","none");
    $(obj).parent().parent().find(".tagged_title").css("display","none");
    $(obj).parent().html('');
}

var deleteTag = function(obj){
    $(obj).parent().parent().remove();
};
