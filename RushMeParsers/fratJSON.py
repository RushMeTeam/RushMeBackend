import json
import requests
from geopy.geocoders import Nominatim


geolocator = Nominatim(country_bias='United States of America', user_agent="RushMeRPI")
mapsApiKey = 'AIzaSyAMjZVCTZ8wopuAt9vGSf2t1kmKbSY07M4'


def addressFormat(inputString):
    copy = inputString
    for letter in copy:
        if letter == ' ':
            letter = '+'
    return copy

def parseFraternities(filename):
    file = open(filename, 'r')
    parsing = False
    counter = 0
    key = ''
    fraternityList = []
    jsonDict = {}
    for line in file:
        if len(line) == 0:
            continue
        if line[0] == '=':
            parsing = not parsing
            if (counter > 0):
                location = requests.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + addressFormat(jsonDict['address']), params={'key': 'AIzaSyAMjZVCTZ8wopuAt9vGSf2t1kmKbSY07M4'})
                print(addressFormat(jsonDict['address']))
                newLocation = geolocator.geocode(jsonDict['address'] + ' Troy, New York')
                print(newLocation.raw)
                jsonDict['coordinates'] = ((newLocation.longitude, newLocation.latitude))
                fraternityList.append(jsonDict)
                jsonDict = {}
            counter = 0
        else:
            # counter is either even or odd, on even lines , read a key
            # on odd lines store a key:value pair in the dictionary.
            if (counter % 2) == 0:
                i = 1
                while i < len(line):
                    if(line[i] == '(' or line[i] == ':'):
                        break
                    key += line[i]
                    i += 1
            else:
                jsonDict[key] = line.strip()
                key = ''
            counter += 1
        
    file.close()
    jsonObject = json.dumps(fraternityList)
    jsonReturn = json.loads(jsonObject)
    print(jsonReturn)
    return jsonReturn
        

file2 = open('output.txt', 'w')
json.dump(parseFraternities('testJSON.txt'), file2)