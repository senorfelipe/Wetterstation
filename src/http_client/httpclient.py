import requests


class HttpClient:
    def __init__(self, url):
        self.url = url

    def post_json_data(self, json):
        r = requests.post(self.url, json=json)
        return r.status_code

    def post_file(self, file_path, data):
        with open(file_path, 'rb') as payload:
            image = {'image': payload}
            r = requests.post(self.url, files=image, data=data)
            return r.status_code

    def get(self, query_params=''):
        r = requests.get(self.url, params=query_params)
        return [r.text, r.status_code]
