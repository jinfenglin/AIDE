import os
def getArray(log):
    res=[0]*10
    i=0
    for line in log:
        sample,fs=line.split(',')
        #print fs,(i+1)*10
        while float(fs)>=(i+1)/10.0:
            #print "fs:bar",fs,(i+1)/10.0
            res[i]=int(sample)
            i+=1       
    while(i<=9):
        res[i]=int(log[-1].split(',')[0])
        i+=1
    #print res
    return res

def addArray(ar1,ar2):
    res=[]
    for e1,e2 in zip(ar1,ar2):
        res.append(e1+e2)
    return res
def average(array,count):
    return [float(element)/count for element in array]

if __name__=="__main__":
    case="./results/case13/"
    dirs=os.listdir(case)
    hybird_sum=[0]*10
    h_count=0
    user_sum=[0]*10
    u_count=0
    normal_sum=[0]*10
    n_count=0

    for dir in dirs:
        if not os.path.isdir(case+dir):
            continue
        files=os.listdir(case+dir)
        for file in files:
            if '.csv' not in file:
                continue
            with open(case+dir+'/'+file) as fin:
                print dir,file
                log=[line for line in fin]
                res=getArray(log)
                #print res
                if 'normal' in file:
                    normal_sum=addArray(normal_sum,res)
                    n_count+=1
                    
                elif 'hybird' in dir:
                    hybird_sum=addArray(hybird_sum,res)
                    h_count+=1
                else:
                    user_sum=addArray(user_sum,res)
                    u_count+=1
      
    print 'hybird:'
    for it in average(hybird_sum,h_count):
        print it
    print 'userbased:'
    for it in average(user_sum,u_count):
        print it
    print 'normal:'
    for it in average(normal_sum,n_count):
        print it
               
