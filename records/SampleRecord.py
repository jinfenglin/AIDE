import os
import random
if __name__=='__main__':
    files=os.listdir("../records")
    for fname in files:
        if '.csv' in fname:
            with open("../records/"+fname) as fin,open("../pruned_records/"+fname,'w') as fout:
                for line in fin:
                    label=line.split(',')[2]
                    if label!='-1':
                        fout.write(line)
                    else:
                        rand=random.randint(1, 100)
                        if rand>100:
                            fout.write(line)
