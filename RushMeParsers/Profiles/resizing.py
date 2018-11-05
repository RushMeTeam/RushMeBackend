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
    width, height = im.size
    ratio = width/480
    width = 480
    height = height/ratio
    im = im.resize([int(width), int(height)],Image.ANTIALIAS)
    im.save(outfileSmall, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)

try:
    im = Image.open(infile)
    width, height = im.size
    ratio = width/1080
    width = 1080
    height = height/ratio
    im = im.resize([int(width), int(height)],Image.ANTIALIAS)
    im.save(outfileSemi, "JPEG")
except IOError:
    print ('cannot create thumbnail for ', infile)