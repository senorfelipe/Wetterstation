import json
import time

data = json.load(open('./MOCK_DATA.json'))
i = 0
for jsn in data:
    if i == 50:
        break
    jsn['weather']['temp'] = str(jsn['weather']['temp'])
    jsn['weather']['windDir'] = str(jsn['weather']['windDir'])
    jsn['weather']['windSpeed'] = str(jsn['weather']['windSpeed'])
    jsn['energy']['pv']['power'] = str(jsn['energy']['pv']['power'])
    jsn['energy']['pv']['voltage'] = str(jsn['energy']['pv']['voltage'])
    jsn['energy']['battery']['current'] = str(jsn['energy']['battery']['current'])
    jsn['energy']['battery']['voltage'] = str(jsn['energy']['battery']['voltage'])
    jsn['energy']['battery']['temperature'] = str(jsn['energy']['battery']['temperature'])
    jsn['energy']['load']['voltage'] = str(jsn['energy']['load']['voltage'])
    jsn['energy']['load']['current'] = str(jsn['energy']['load']['current'])
    jsn['energy']['controller']['mode'] = str(jsn['energy']['controller']['mode'])
    new_json = open('./mock/' + str(int(time.time()) + i) + '.json', 'w+')
    new_json.write(json.dumps(jsn))
    i = i + 1
