import os
import sys
import Image

semiSize = 1920, 1080
smallSize = 640,480

outfileSmall = os.path.splitext(infile)[0] + '.thumbnail'
outfileSemi = os.path.splitext(infile)[0] + 'semi.jpg'

infile = 'dog.jpg'

try:
    im = Image.open(infile)
    im.thumbnail(smallSize,Image.ANTIALIAS)
    im.save(outfileSmall, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)

try:
    im = Image.open(infile)
    im.thumbnail(semiSize,Image.ANTIALIAS)
    im.save(outfileSemi, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)
