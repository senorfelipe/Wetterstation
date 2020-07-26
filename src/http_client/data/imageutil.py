import random
from io import BytesIO
from time import time

import requests
from PIL import Image

url = 'https://source.unsplash.com/1600x900/?grass'
for i in range(1, 15, 1):
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    filename = str(int(time()) + random.randrange(1, 200)) + '.jpeg'
    img = img.convert('RGB')
    img.save('mock/' + filename)
    print('saved ' + str(i) + '.' + 'image: ' + filename)
