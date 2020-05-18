import os

import requests

os.environ['NO PROXY'] = '127.0.0.1'


class HttpClient:
    def __init__(self, url):
        self.url = url

    def post(self, data):
        r = requests.post(self.url, data=data)
        return r.status_code

    def get(self, query_params=''):
        r = requests.get(self.url, params=query_params)
        return [r.text, r.status_code]


timestamp = '2020-05-18T11:00:00Z'
temperature = {'value': '144.6', 'time': timestamp}
wind = {'speed': '100.0', 'direction': '666.0', 'time': timestamp}
temp = HttpClient('http://127.0.0.1:8000/api/temps/')
temp.post(temperature)
temp.get()
windig = HttpClient('http://127.0.0.1:8000/api/wind/')
windig.post(wind)
print(windig.get({'month': 5}))
