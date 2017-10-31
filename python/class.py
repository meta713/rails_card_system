# -*- coding: utf-8 -*-

from __future__ import print_function
import json
import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado import options
from time import sleep
import sys
import stringbin
import pymysql
import rcs620s
import pymysql

def hexdmp(strhex,delimiter) :
	u""" 文字列（中身はバイナリ）をHEXダンプする """
	result = ""
	for c in strhex :
		result += c.encode('hex')
		result += delimiter


	if ( 0<len(delimiter) ) :
		# 最後に付けてしまっているdelimiterを取る
		result = result[:-len(delimiter)]

	return result


class MainHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render("socket.html")

class WebSocket(tornado.websocket.WebSocketHandler):
    #ソケットクラスのフィールド一覧
    waiters = set()
    COMMAND_TIMEOUT = 5000
    rcs620sObj = None
    is_error = False

    def open(self):
        print("open websocket connection")
        self.waiters.add(self)

    def on_message(self, message):
        print( message )
        # if self.is_error:
        #     self.rcs620sObj.rfOff()
        #     self.is_error = False
        #     self.send_mes( res_data , self )
        #     print("エラーです2")
        #     return

        #メッセージはjson形式で受け取る、それ以外ならエラーを返す
        try:
            page_data = json.loads( message )
            #pageというkeyを持つか
            if "page" in page_data:
                #レスポンス用のオブジェクトデータ
                res_data = {}
                #バッファ
                buf = None
                if page_data["page"] == "regist" or page_data["page"] == "change" or page_data["page"] == "use" :
                    #登録の処理を実行
                    #リーダーオブジェクトの作成
                    self.rcs620sObj = rcs620s.Rcs620s()
                    #カードリーダー機器の確認
                    ret = self.rcs620sObj.initDevice()
                    if ret != "":
                        #print(ret)
                        res_data["status"] = "error"
                        self.send_mes( res_data , self )
                        return
                    #リーダーの準備完了
                    res_data["status"] = "ready"
                    res_data["action"] = page_data["page"]
                    self.send_mes( res_data , self )
                    rcs620s.timeout = self.COMMAND_TIMEOUT
                    #リード回数
                    count = 0
                    while buf is None and count < 40 :
                        #and not( self.is_error ):
                        #ポーリング(約2s)
                        if(self.rcs620sObj.polling("\xFE\x00")):
                            #カードを認識すれば、データを読む(形式はFCFのみ、そのほかのカードの場合は別途リクエストコードが必要)
                            # FCF
                            buf = self.rcs620sObj.readBlock("\x8B\x1A", 0, 1)
                            if( buf is not None ):
                                #bufの中身があれば、カードからデータを取得
                                data = self.rcs620sObj.readWithoutEncryption("\x8B\x1A", 0, 4)
                                #idm
                                idm = hexdmp(self.rcs620sObj.idm,"")
                                #print("個人識別番号:"+data[2:14])
                                #print("名前:"+data[16:32].decode('shift-jis').encode('utf-8'))
                                # print("利用区分:"+data[:2])
                                # print("発行回数:"+data[14])
                                # print("性別:"+data[15])
                                # print("学校識別番号:"+data[32:40])
                                # print("発行年月日:"+data[40:48])
                                # print("有効期限:"+data[48:56])
                                if page_data["page"] == "regist":
                                    #res_data["status"] = "ok"
                                    res_data["data"] = { "user_name" : data[16:32].decode('shift-jis').encode('utf-8') ,"student_number" : data[2:14]  , "idm" : idm }
				    dbh = pymysql.connect(
                    				         host='localhost',
                    				         user='root',
                    				         password='doyadoya4141',
                    				         db='design_studio',
                    				         charset='utf8',
                    				         cursorclass=pymysql.cursors.DictCursor
                    				    )
				    stmt = dbh.cursor()
                                    sql = "select * from kit_user2 where userNo = (select userNo from id_user2 where id_user2.stopFlg = 'A' and id_user2.idm = '" + idm + "')"
                                    stmt.execute(sql)
                                    rows = stmt.fetchall()
				    if len(rows) != 0:
				        res_data["data"]["is_error"] = True
                                else:
                                    dbh = pymysql.connect(
                    				         host='localhost',
                    				         user='root',
                    				         password='doyadoya4141',
                    				         db='design_studio',
                    				         charset='utf8',
                    				         cursorclass=pymysql.cursors.DictCursor
                    				    )
                                    stmt = dbh.cursor()
                                    sql = "select * from kit_user2 where userNo = (select userNo from id_user2 where id_user2.stopFlg = 'A' and id_user2.idm = '" + idm + "')"
                                    stmt.execute(sql)
                                    rows = stmt.fetchall()
                                    if len(rows) == 0:
                                        res_data["data"] = { "is_error" : True , "idm" : idm }
                                    else :
                                        row = rows[0]
                                        res_data["data"] = { "user_name" : row["name"] , "student_number" : row["personalID"] ,
                                        "phone_number" : row["tel"] , "email" : row["mail"] , "idm" : idm , "userNo" : row["userNo"] , "is_error" : False }
                                res_data["status"] = "ok"
                                self.send_mes( res_data , self )
                                self.rcs620sObj.rfOff()
                                print("データを取得しました")
                                return
                        count += 1
                        sleep(0.5)
                    #リーダオブジェクトの停止
                    self.rcs620sObj.rfOff()
                    # if self.is_error :
                    #     self.send_mes( { "status" : "error" } , self )
                    #     print("エラーです3")
                    #     self.is_error = False
                    #     return
                    if count >= 40 :
                        res_data["status"] = "timeout"
                        self.send_mes( res_data , self )
                        print("タイムアウトです")
                    return
                else:
                    #エラー処理の実行、pageがregist、change以外
                    res_data["status"] = "error"
                    self.send_mes( res_data , self )
                    print("エラーです1")
                    return
            else:
                #エラー処理の実行、page_dataオブジェクトがpageというkeyを保持していない
                self.send_mes( { "status" : "error" } , self )
                print("エラーです4")
                return
        except:
            #jsonロードのエラー、エラー処理の実行
            self.send_mes( { "status" : "error" } , self )
            #セキュリティ的にエラーコードは投げない方がいい気がする、この場合は
            print("エラーです5")
            return #一応
        # page_data = json.loads(message)
        # res_data = {"data":page_data["page"]}
        # res_data["status"] = "ok"
        # print(res_data)
        # self.send_mes( res_data , self )
        # rcs620sObj = rcs620s.Rcs620s()
        # buf = None
        # ret = rcs620sObj.initDevice()
        # if (ret!="") :
        #     print(ret)
        #     return
        # rcs620s.timeout = self.COMMAND_TIMEOUT
        # count = 0
        # while buf is None and count < 5:
        #     if(rcs620sObj.polling("\xFE\x00")):
        #         buf = rcs620sObj.readBlock("\x8B\x1A", 0, 1)
        #         if(buf is not None) :
        #             data = rcs620sObj.readWithoutEncryption("\x8B\x1A", 0, 4)
        #             idm = str(hexdmp(rcs620sObj.idm,""))
        #             print("idm:",idm)
        #             res_data = {"status":"ok_read"}
        #             self.send_mes( res_data , self )
        #             break
        #     count += 1
        #     sleep(0.5)
        # rcs620sObj.rfOff()
        # if count >= 5:
        #     self.send_mes( {"status":"no_read"} , self )
        # else:
        #     print("ok!! read your card!!")
        # # try:
        # #
        # #
        # # except:
        # #     print("message error")
        # #     res_data = {"status":"error"}
        # #     self.send_mes( res_data , self )

    def on_close(self):
        print("close websocket connection")
        # self.is_error = True
        # self.rcs620sObj.rfOff()

    def check_origin(self, origin):
        return True

    def send_mes( self , message , me ):
        for waiter in self.waiters:
            if waiter == me:
                waiter.write_message(json.dumps(message))

app = tornado.web.Application([
    (r"/", MainHandler),
    (r"/ws", WebSocket),
])

if __name__ == "__main__":
    options.parse_command_line()
    app.listen(9999)
    print("Server Start!!")
    tornado.ioloop.IOLoop.instance().start()

# for waiter in self.waiters:
#     if waiter == self:
#         waiter.write_message(json.dumps(res_data))
