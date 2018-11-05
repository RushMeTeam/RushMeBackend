import json
from geopy.geocoders import Nominatim


geolocator = Nominatim(country_bias='United States of America', user_agent="RushMeRPI")

allowed = ['ACA',
'ACR',
'AEP',
'ASP',
'CHP',
'DKE',
'DTD',
'DTP',
'LCA',
'PGD',
'PKA',
'PKT',
'PLP',
'PMD',
'PSK',
'PUS',
'SAE',
'SMC',
'SPE',
'TEP',
'TTX',
'ZTP']

def parseEvents(filename):
    file = open(filename, 'r')
    parsing = False
    counter = 0
    key = ''
    fraternityList = []
    jsonDict = {}
    for line in file:
        if len(line) == 0:
            continue
        if line[0] == '/' or line[0] == '\\':
            parsing = not parsing
            if (counter > 0):
                newLocation = geolocator.geocode(jsonDict['location'] + ' Troy, New York')
                if(newLocation != None):
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
        if line[0] == '=' and parsing == True:
            parsing = not parsing
            print(jsonDict)
            newLocation = geolocator.geocode(jsonDict['address'] + ' Troy, New York')
            if newLocation != None:
                jsonDict['coordinates'] = ((newLocation.longitude, newLocation.latitude))
            desc = ''
            for item in jsonDict['description']:
                desc = desc + item
            jsonDict['description'] = desc
            if (jsonDict['namekey'] in allowed):
                fraternityList.append(jsonDict)
            jsonDict = {}
        elif (parsing == False and line[0] == '='):
            parsing = True
        elif (line[0] == "*"): #found a key
            key = ''
            i = 1
            while i < len(line):
                if(line[i] == '(' or line[i] == ':'):
                    break
                key += str(line[i])
                i += 1
            if (key == 'description'):
                jsonDict[key] = []
        else:
            #if(key == 'description'):
                #jsonDict[key].append(line.strip())
                #continue
            jsonDict[key] = line.strip()

    file.close()
    jsonObject = json.dumps(fraternityList)
    jsonReturn = json.loads(jsonObject)
    print(jsonReturn)
    return jsonReturn
    
def parseEvents2(filename):
    file = open(filename, 'r')
    parsing = False
    counter = 0
    key = ''
    fraternityList = []
    jsonDict = {}
    for line in file:
        if len(line) == 0:
            continue
        if line[0] == '/':
            newLocation = geolocator.geocode(jsonDict['location'] + ' Troy, New York')
            if newLocation != None:
                jsonDict['coordinates'] = (newLocation.longitude, newLocation.latitude)
                
            if jsonDict['description'] == "--" :
                jsonDict['description'] = None
                
            fraternityList.append(jsonDict)
            print(jsonDict)
            jsonDict = {}
        elif (line[0] == '\\'):
            parsing = True
        elif (line[0] == "*"): #found a key
            key = ''
            i = 1
            while i < len(line):
                if(line[i] == '(' or line[i] == ':'):
                    break
                key += str(line[i])
                i += 1
        else:
            jsonDict[key] = line.strip()

    file.close()
    jsonObject = json.dumps(fraternityList)
    jsonReturn = json.loads(jsonObject)
    print(jsonReturn)
    return jsonReturn


file2 = open('fraternitiesJSON.txt', 'w')
json.dump(parseFraternities('fraternityInfo.txt'), file2)
#json.dump(parseEvents2('eventInfo.txt'),file2)
