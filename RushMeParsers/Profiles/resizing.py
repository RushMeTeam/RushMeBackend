import os
import sys
from PIL import Image

semiSize = [1920, 1080]
smallSize = [640,480]

infile = sys.argv[1]

outfileSmall = os.path.splitext(infile)[0] + 'small.jpg'
outfileSemi = os.path.splitext(infile)[0] + 'semi.jpg'

try:
    im = Image.open(infile)
    im = im.resize(smallSize,Image.ANTIALIAS)
    im.save(outfileSmall, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)

try:
    im = Image.open(infile)
    im = im.resize(semiSize,Image.ANTIALIAS)
    im.save(outfileSemi, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)
