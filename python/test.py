from multiprocessing import Process
import time
 
def countDown(n,name):
    while n > 0:
	print(name)
	time.sleep(0.2)
        n -= 1
 
 
n = int(100)
n1, n2, n3, n4 = int(n/4), int(n/4), int(n/4), int(n/4)
 
jobs = [
    Process(target=countDown, args=(n1,"num1",)),
    Process(target=countDown, args=(n2,"num2",)),
    Process(target=countDown, args=(n3,"num3",)),
    Process(target=countDown, args=(n4,"num4",)),
    ]
 
start_time = time.time()
for j in jobs:
    j.start()
 
#for j in jobs:
#    j.join()
 
finish_time = time.time()
print(finish_time - start_time)
