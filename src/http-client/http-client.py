import os

import requests

os.environ['NO PROXY'] = '127.0.0.1'


class HttpClient:
    def __init__(self, url):
        self.url = url

    def post_data(self, data):
        r = requests.post(self.url, data=data)
        return r.status_code

    def post_file(self, file_path):
        with open(file_path, 'rb') as payload:
            r = requests.post(self.url, data=payload)

    def get(self, query_params=''):
        r = requests.get(self.url, params=query_params)
        return [r.text, r.status_code]

#
# temperature = {'degrees': '144.6', 'time': '2020-04-20T21:55:38.20Z'}
# wind = {'speed': '100.0', 'direction': '666.0', 'time': '2020-04-20T21:55:38.20Z'}
# temp = HttpClient('http://localhost:8000/api/temps/')
# temp.post_data(temperature)
# temp.get()
# windig = HttpClient('http://localhost:8000/api/wind/')
# windig.post_data(wind)
# print(windig.get({'start': "2020-04-30"}))

image = HttpClient('http://localhost:8000/api/images/')
image.post_file(file_path='example.jpg')

