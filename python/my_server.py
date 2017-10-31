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

    def open(self):
        print("open websocket connection")
        #self.write_message("")
        self.waiters.add(self)

    def on_message(self, message):
        print(message)
        page_data = json.loads(message)
        res_data = {"data":page_data["page"]}
        res_data["status"] = "ok"
        print(res_data)
        self.send_mes( res_data , self )
        rcs620sObj = rcs620s.Rcs620s()
        buf = None
        ret = rcs620sObj.initDevice()
        if (ret!="") :
            print(ret)
            return
        rcs620s.timeout = self.COMMAND_TIMEOUT
        count = 0
        while buf is None and count < 5:
            if(rcs620sObj.polling("\xFE\x00")):
                buf = rcs620sObj.readBlock("\x8B\x1A", 0, 1)
                if(buf is not None) :
                    data = rcs620sObj.readWithoutEncryption("\x8B\x1A", 0, 4)
                    idm = str(hexdmp(rcs620sObj.idm,""))
                    print("idm:",idm)
                    res_data = {"status":"ok_read"}
                    self.send_mes( res_data , self )
                    break
            count += 1
            sleep(0.5)
        rcs620sObj.rfOff()
        if count >= 5:
            self.send_mes( {"status":"no_read"} , self )
        else:
            print("ok!! read your card!!")
        # try:
        #
        #
        # except:
        #     print("message error")
        #     res_data = {"status":"error"}
        #     self.send_mes( res_data , self )

    def on_close(self):
        print("close websocket connection")

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
