Data_Format = function( user_name , student_number , phone_number , email , idm  , action  , recog ){
  this.index = 0;
  this.idm = idm;
  this.recog = recog;
  this.action = action;
  this.user_name = user_name;
  this.student_number = student_number;
  this.phone_number = phone_number;
  this.email = email;
}

Data_Format.prototype.push = function( data , i ){
  if( i == undefined ){
    switch( this.index ){
      case 0:{
        this.user_name = data;
        break;
      }
      case 1:{
        this.student_number = data;
        break;
      }
      case 2:{
        this.phone_number = data;
        break;
      }
      case 3:{
        this.email = data;
        break;
      }
      default:{
        this.index = 0;
        break;
      }
    }
    this.index = ( this.index + 1 ) % 4;
    return;
  }else if( !isNaN( i ) ){
    switch( i ){
      case 0:{
        this.user_name = data;
        return;
      }
      case 1:{
        this.student_number = data;
        return;
      }
      case 2:{
        this.phone_number = data;
        return;
      }
      case 3:{
        this.email = data;
        return;
      }
      default:{
        return;
      }
    }
  }else{
    return;
  }
}

Data_Format.prototype.createjson = function(){
  return JSON.stringify({
    "action" : this.action , "idm" : this.idm ,
    "user_name" : this.user_name , "student_number" : this.student_number ,
    "phone_number" : this.phone_number , "email" : this.email ,
    "recog" : this.recog
  });
}

Data_Format.prototype.createObj = function(){
  return {
    "action" : this.action , "idm" : this.idm ,
    "user_name" : this.user_name , "student_number" : this.student_number ,
    "phone_number" : this.phone_number , "email" : this.email ,
    "recog" : this.recog
  };
}

/**
 * URL解析して、クエリ文字列を返す
 * @returns {Array} クエリ文字列
 */
function getUrlVars()
{
    var vars = {}, max = 0, hash = "", array = "";
    var url = window.location.search;

        //?を取り除くため、1から始める。複数のクエリ文字列に対応するため、&で区切る
    hash  = url.slice(1).split('&');
    max = hash.length;
    for (var i = 0; i < max; i++) {
        array = hash[i].split('=');    //keyと値に分割。
        //vars.push(array[0]);    //末尾にクエリ文字列のkeyを挿入。
        vars[array[0]] = array[1];    //先ほど確保したkeyに、値を代入。
    }

    return vars;
}
