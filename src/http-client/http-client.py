import os
import requests

os.environ['NO PROXY'] = '127.0.0.1'
r = requests.get('http://127.0.0.1:8000/api/wind/')
print(r.status_code)
print(r.headers['Content-Type'])
print(r.text)

p = requests.post('http://127.0.0.1:8000/api/wind')
print(help(p.content))

