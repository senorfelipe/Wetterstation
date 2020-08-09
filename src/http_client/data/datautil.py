import json
import time

data = json.load(open('./MOCK_DATA_2.json'))
i = 0
for jsn in data:
    new_json = open('./mock/' + str(int(time.time()) + i) + '.json', 'w+')
    new_json.write(json.dumps(jsn))
    i = i + 1
