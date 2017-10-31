$(function(){
  user_data = new Data_Format();
  $("#submit_btn").on("click",function(){
    //var $btn = $(this).button('loading');
    if( chk_form() ){
      //$btn.button('reset');
      $(".input_data").toggle();
      $(".confirm_data").toggle();
      $(".btn_group").toggle();
      $(this).hide();
      //$("#ConfirmModal").modal("show");
    }else{
      //alert("no");
      //$btn.button('reset');
    }
  });
  //修正ボタンクリック
  $("#back_btn").on("click",function(){
    $(".input_data").toggle();
    $(".confirm_data").toggle();
    $(".btn_group").toggle();
    $("#submit_btn").show();
  })
  //送信ボタンクリック
  $("#send_btn").on("click",function(){
    //$("#back_btn").hide();
    var $btn = $(this).button('loading');
    $.LoadingOverlaySetup({
      color : "rgba(255,255,255,1)"
    });
    $(".regist_form").LoadingOverlay("show", {
      image       : img_path
    });
    $(".side_menu").animate({
      left : "-22%"
    });
    $.ajax({
      type : "POST",
      url : "/base/regist_data",
      data : { data : user_data.createjson() },
      success : function( res ){
        console.log("success");
        console.log(res);
        setTimeout(function(){
          $(".regist_form").LoadingOverlay("hide");
          $(".side_menu").animate({
            left : "0%"
          });
          //$(".side_menu").LoadingOverlay("hide");
          $btn.button('reset');
          swal({
            title:"Success!",
            text: '完了しました、ホームに戻ります！',
            type:"success"
          },
          function(dismiss){
            window.location.href = "/base/top";
            //console.log("this is test");
          }
          );
        },2000);
      },
      error : function( e ){
        console.log("this is error");
        console.log(e);
      }
    });
    // $(".side_menu").LoadingOverlay("show", {
    //   image       : "Preloader_1.gif"
    // });
  });
  $("#student_number").formatter({
    'pattern': '{{9999999999}}'
  });
  $("#phone_number").formatter({
    'pattern': '{{999}}{{9999}}{{9999}}'
  });
  // var page_info = getUrlVars(location.search);
  if( page_info == "regist" || page_info == "change" ){
    //$("#alert_connecting").slideToggle("normal");
    iziToast.info({
      id : "info_toast",
      title: 'Info',
      message: 'サーバと接続中です。しばらくお待ちください。',
      target : "#alert_area",
      timeout: false,
      progressBar: false,
    });
    setTimeout(function(){
      var host = "ws://localhost:9999/ws";
      var socket = new WebSocket(host);
      if(socket){

         socket.onopen = function(){
           //console.log(JSON.stringify(getUrlVars(location.search)));
           ///getUrlVars(location.search)
           //JSON.stringify()
           socket.send(JSON.stringify({"page":page_info}));
           //socket.send("this is test");
         }

         socket.onmessage = function(msg){
           //showServerResponse(msg.data);
           console.log(msg);
           setTimeout(function(){
             //$("#alert_connecting").hide("slow");
             try {
               res_data = JSON.parse(msg.data);
               if(res_data["status"] == "ready"){
                 //$("#alert_ready").slideToggle("slow");
                 iziToast.success({
                   title: 'Success',
                   message: '準備ができました！ カードをタッチしてください。',
                   target : "#alert_area",
                   timeout: false,
                   progressBar: false,
                 });
               }else if(res_data["status"] == "ok"){
                 console.log(res_data);
                 user_data.idm = res_data["data"]["idm"];
                 user_data.action = res_data["action"];
                 if( res_data["data"]["is_error"] ){
                   if( res_data["action"] == "regist" ){
                     //登録済み
                     swal({
                       title: "このカードは登録済みです！",
                       text: "ホームに戻ります",
                       type: "warning",
                       confirmButtonColor: "#DD6B55",
                       confirmButtonText: "OK",
                       closeOnConfirm: false,
                     },
                     function(isConfirm){
                       if (isConfirm) {
                         window.location.href = "/base/top";
                       } else {
                         window.location.href = "/base/top";
                       }
                     });
                   }else{
                     //未登録
                     swal({
                       title: "カードが未登録です!",
                       text: "新規にカードを登録しますか？",
                       type: "warning",
                       showCancelButton: true,
                       confirmButtonColor: "#DD6B55",
                       confirmButtonText: "登録します",
                       cancelButtonText: "ホームに戻ります",
                       closeOnConfirm: false,
                       closeOnCancel: false
                     },
                     function(isConfirm){
                       if (isConfirm) {
                         window.location.href = "/base/regist";
                       } else {
                         window.location.href = "/base/top";
                       }
                     });
                   }
                 }
                 for(key in res_data["data"]){
                   $("#"+key).val(res_data["data"][key]);
                 }
                 //$("#user_name").attr("disabled","");
                 //$("#student_number").attr("disabled","");
                //  $("#user_name").val(res_data["data"]["user_name"]);
                //  $("#student_number").val(res_data["data"]["student_number"]);
                //  $("#alert_ok").slideToggle("slow",function(){
                //    setTimeout(function(){
                //      $("#cancel_btn").slideToggle("slow");
                //      $("#cancel_btn").on("closed.bs.alert",function(){
                //        $("#alert_area").slideToggle("slow",function(){
                //          $(this).remove();
                //        });
                //      });
                //    },500);
                //  });
                 iziToast.success({
                   title: 'Complete',
                   message: 'カードを確認しました！ 情報を登録してください。',
                   target : "#alert_area",
                   timeout: false,
                   progressBar: false,
                 });
                 //$("#alert_connecting").hide("slow");
                 //$("#alert_ready").hide("slow");
               }else if(res_data["status"] == "timeout"){
                 iziToast.error({
                   title: 'Error',
                   message: "タイムアウトです、もう一度最初からお願いします。",
                   target : "#alert_area",
                   timeout: false,
                   progressBar: false,
                 });
                //  $("#alert_timeout").slideToggle("slow",function(){
                //    setTimeout(function(){
                //      $("#cancel_btn").slideToggle("slow");
                //      $("#cancel_btn").on("closed.bs.alert",function(){
                //        $("#alert_area").slideToggle("slow",function(){
                //          $(this).remove();
                //        });
                //      });
                //    },500);
                //  });
               }else if(res_data["status"] == "error"){
                 iziToast.error({
                   title: 'Error',
                   message: "エラーです。もう一度最初からお願いします。",
                   target : "#alert_area",
                   timeout: false,
                   progressBar: false,
                 });
                //  $("#alert_fail").slideToggle("slow",function(){
                //    setTimeout(function(){
                //      $("#cancel_btn").slideToggle("slow");
                //      $("#cancel_btn").on("closed.bs.alert",function(){
                //        $("#alert_area").slideToggle("slow",function(){
                //          $(this).remove();
                //        });
                //      });
                //    },500);
                //  });
               }
             } catch (e) {
               console.log("this is test");
               console.log(e);
               iziToast.error({
                 title: 'Error',
                 message: "エラーです。もう一度最初からお願いします。",
                 target : "#alert_area",
                 timeout: false,
                 progressBar: false,
               });
              //  $("#alert_fail").slideToggle("slow",function(){
              //    setTimeout(function(){
              //      $("#cancel_btn").slideToggle("slow");
              //      $("#cancel_btn").on("closed.bs.alert",function(){
              //        $("#alert_area").slideToggle("slow",function(){
              //          $(this).remove();
              //        });
              //      });
              //    },500);
              //  });
             }
           },500);
         }

         socket.onerror = function(){
           console.log("error");
           iziToast.error({
             title: 'Error',
             message: "エラーです。もう一度最初からお願いします。",
             target : "#alert_area",
             timeout: false,
             progressBar: false,
           });
         }

         socket.onclose = function(){
           //alert("connection closed....");
           //showServerResponse("The connection has been closed.");
         }

       }else{
         //$("#alert_connecting").slideToggle("slow");
         iziToast.error({
           title: 'Error',
           message: "エラーです。もう一度最初からお願いします。",
           target : "#alert_area",
           timeout: false,
           progressBar: false,
         });
         console.log("invalid socket");
       }
    },700);
  }
})

function chk_form(){
  console.log("this is test");
  var array = [];
  if(!$("#user_name").val()) array.push("氏名を入力してください");
  if(!$("#student_number").val()) array.push("学籍番号を入力してください");
  if(!$("#phone_number").val()) array.push("電話番号を入力してください");
  if(!$("#email").val()) array.push("メールアドレスを入力してください");

  if( array.length > 0 ){
    $("#error_area").html("<p>" + array.join("<br>")).show();
    return false;
  }else{
    $("#error_area").html("").hide();
    elem = $("#regist_form input");
    label = $(".confirm_data");
    for(i = 0 ; i < elem.length ; i++){
      user_data.push($(elem[i]).val());
      $(label[i]).text($(elem[i]).val());
    }
    console.log(user_data.createObj());
    return true;
  }
}
