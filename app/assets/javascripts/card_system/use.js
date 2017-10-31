/*$(function(){
  user_data = new Data_Format();
  $("[btn]").on("click",function(){
    if ( !$(this).find("a").attr("disabled") ){
      var text = $(this).find("span").text();
      var attr = $(this).attr("btn");
      $(this).find("span").text($("[btn]:first").find("span").text());
      $(this).attr("btn",$("[btn]:first").attr("btn"));
      $("[btn]:first").attr("btn",attr);
      $("[btn]:first").find("span").attr("btn");
      $("[btn]:first").find("span").text(text);
      $("[btn]").find("a").attr("disabled","true");
      $("[btn]").animate({
        "margin-left" : "0px",
        "width" : "33.33333333%",
        "padding" : "14px"
      });
      $("[btn] > a").animate({
        "border-radius" : "50px"
      });
      $("[btn]:first").animate({
        "margin-left" : "0px",
        "width" : "100%",
        "padding" : "40px"
      },{
        "complete" : function(){
          user_data.recog = attr;
          connect_socket_use();
        }
      });
      // $("[btn]:first").find("a").animate({
      //   "border-radius" : "6px"
      // });
      //console.log($("[btn]")[0]);
    }
  });
})

function connect_socket_use(){
  if( page_info == "use" ){
    iziToast.info({
      class: 'toast',
      id : "info_toast",
      title: 'Info',
      message: 'サーバと接続中です。しばらくお待ちください。',
      position: 'topRight',
      timeout: false,
      progressBar: false,
    });
    setTimeout(function(){
      var host = "ws://localhost:9999/ws";
      var socket = new WebSocket(host);
      if(socket){

         socket.onopen = function(){
          //  console.log(JSON.stringify(getUrlVars(location.search)));
           ///getUrlVars(location.search)
           //JSON.stringify()
           socket.send(JSON.stringify({"page":page_info}));
           //socket.send("this is test");
         }

         socket.onmessage = function(msg){
           //showServerResponse(msg.data);
          //  console.log(msg);
           setTimeout(function(){
             //$("#alert_connecting").hide("slow");
             try {
               res_data = JSON.parse(msg.data);
               if(res_data["status"] == "ready"){
                 //$("#alert_ready").slideToggle("slow");
                 iziToast.success({
                   class: 'toast',
                   title: 'Success',
                   message: '準備ができました！ カードをタッチしてください。',
                   position: 'topRight',
                   timeout: false,
                   progressBar: false,
                 });
               }else if(res_data["status"] == "ok"){
                 //console.log(res_data);
                 console.log(res_data["data"]["is_error"]);
                 if( res_data["data"]["is_error"] ){
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

                 }else{
                   //利用可能
                   user_data.idm = res_data["data"]["idm"];
                   user_data.action = res_data["action"];
                   iziToast.success({
                     class: 'toast',
                     title: 'Complete',
                     message: 'カードを確認しました！',
                     position: 'topRight',
                     timeout: false,
                     progressBar: false,
                   });
                   var toast = document.getElementsByClassName("toast");
                   var len = toast.length;
                   for( var i = 1 ; i < len ; i++ ){
                     iziToast.hide( {transitionOut: 'fadeOutUp'} , toast[i] );
                   }
                  //  setTimeout( function(){
                  //
                  //  } , 2000 );
                   $.ajax({
                     type : "POST",
                     url : "/base/regist_data",
                     data : { data : user_data.createjson() },
                     success : function( res ){
                       console.log(res);
                       console.log("success");
                       try{
                         res_data = JSON.parse(res);
                         if( res_data["status"] == "ok" ){
                           swal({
                             title: "確認しました！",
                             text: "工房の利用が可能です！",
                             type: "success",
                             showCancelButton: true,
                             confirmButtonColor: "rgb(97, 229, 76)",
                             confirmButtonText: "ホームに戻ります",
                             cancelButtonText: "利用目的を変更する",
                             closeOnConfirm: false
                           },
                           function(isConfirm){
                             if (isConfirm) {
                               window.location.href = "/base/top";
                             } else {
                               $("[btn]").find("a").removeAttr("disabled");
                               iziToast.destroy();
                             }
                           });
                         }
                       }catch(e){

                       }
                     },
                     error : function( e ){
                       console.log("this is error");
                       console.log(e);
                     }
                   });
                 }
                 //$("#alert_connecting").hide("slow");
                 //$("#alert_ready").hide("slow");
               }else if(res_data["status"] == "timeout"){
                 iziToast.error({
                   class: 'toast',
                   title: 'Error',
                   message: "タイムアウトです、もう一度最初からお願いします。",
                   position: 'topRight',
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
                   class: 'toast',
                   title: 'Error',
                   message: "エラーです。もう一度最初からお願いします。",
                   position: 'topRight',
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
                 class: 'toast',
                 title: 'Error',
                 message: "エラーです。もう一度最初からお願いします。",
                 position: 'topRight',
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
             class: 'toast',
             title: 'Error',
             message: "エラーです。もう一度最初からお願いします。",
             position: 'topRight',
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
           class: 'toast',
           title: 'Error',
           message: "エラーです。もう一度最初からお願いします。",
           position: 'topRight',
           timeout: false,
           progressBar: false,
         });
         console.log("invalid socket");
       }
    },700);
  }
}
*/
