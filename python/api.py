#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function

from time import sleep
import sys
import stringbin
import pymysql
import rcs620s

COMMAND_TIMEOUT = 5000

#print"Content-Type: text/html; charset=utf-8"
#print""
#print"<html><head><meta charset='utf-8'><body>"

# serial port
#SERIAL_PORT_NAME = "/dev/tty.usbserial-A901OF60" #raspberrypiの場合

SERIAL_PORT_NAME = "/dev/tty.usbserial-A901OF5F" #mine
#SERIAL_PORT_NAME = "COM3" #windowsの場合

def printBalance(card_name, balance):
	u""" 残高を表示する """
	print("%s %uyen" % (card_name, balance))

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

if __name__ == '__main__':

	rcs620sObj = rcs620s.Rcs620s()

	buf = None

	ret = rcs620sObj.initDevice()

	if (ret!="") :
		# 初期化失敗→エラーを吐いて終了
		print(ret)
		sys.exit(1)

	rcs620s.timeout = COMMAND_TIMEOUT

	# Suica領域
	if(rcs620sObj.polling("\x00\x03")):
		print(hexdmp(rcs620sObj.idm,":"))
		# Suica PASMO etc
		# http://jennychan.web.fc2.com/format/suica.html
		buf = rcs620sObj.readBlock("\x8B\x00", 0, 1)
		if(buf is not None) :
			balance = stringbin.strbinLE2int(buf[11:13])
			#printBalance("SUICA", balance)

	count = 0
	# 共通領域
	while buf is None and count < 5:
		if(rcs620sObj.polling("\xFE\x00")):
			#print(hexdmp(rcs620sObj.idm,":"))
			#print(hexdmp(rcs620sObj.idm,""))
			# nanaco
			buf = rcs620sObj.readBlock("\x97\x55", 0, 1)
			if(buf is not None) :
				balance = stringbin.strbinLE2int(buf[0:4])
				#printBalance("nanaco", balance)

			# waon
			buf = rcs620sObj.readBlock("\x17\x68", 0, 1)
			if(buf is not None) :
				balance = stringbin.strbinLE2int(buf[0:2])
				#printBalance("WAON", balance)

			# Edy
			buf = rcs620sObj.readBlock("\x17\x13", 0, 1)
			if(buf is not None) :
				balance = stringbin.strbinLE2int(buf[0:4])
				#printBalance("Edy", balance)

			#FCF
			buf = rcs620sObj.readBlock("\x8B\x1A", 0, 1)
			if(buf is not None) :
				data = rcs620sObj.readWithoutEncryption("\x8B\x1A", 0, 4)
				idm = str(hexdmp(rcs620sObj.idm,""))
				print("idm:",idm)
				dbh = pymysql.connect(
				         host='localhost',
				         user='root',
				         password='doyadoya4141',
				         db='design_studio',
				         charset='utf8',
				         cursorclass=pymysql.cursors.DictCursor
				    )
				stmt = dbh.cursor()

				sql = "select * from kit_user2 where userNo = (select userNo from id_user2 where id_user2.idm = '" + idm + "')"

				stmt.execute(sql)

				rows = stmt.fetchall()
				print("length:",len(rows))

				for row in rows:
					for i in row:
						print(i,row[i])

				stmt.close()
				dbh.close()
		count += 1
		sleep(0.5)
	rcs620sObj.rfOff()
	if count >= 5:
		print("fail...")
	else:
		print("success!!")
	#print"</body></html>"
