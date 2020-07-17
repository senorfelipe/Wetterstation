import datetime
import glob
import json
import os
import time

from http_client.httpclient import HttpClient

IMG_FORMAT = '.jpeg'

SEARCH_DIR = './data/mock/'
HOSTNAME = 'http://localhost:8000'
SENSOR_DATA_API_URL = '/api/sensor-data'
IMAGES_API_URL = '/api/images/'
MEASUREMENT_SESSION_ID = int(time.time())


def find_and_post_data():
    os.chdir(SEARCH_DIR)
    files = get_json_files()
    to_post = []
    for file in files:
        with open(file) as json_file:
            data = json.load(json_file)
            add_session_id(data, os.path.splitext(file)[0])
            to_post.append(data)
    status = post_data(to_post)
    if status == 201:
        for file in files:
            os.remove(file)

    images = get_images()
    for image in images:
        img_path = SEARCH_DIR + image
        status = post_image(img_path)
        if status == 201:
            print('posted image: ' + os.path.basename(image))
            os.remove(img_path)
    os.chdir('../../')


def add_session_id(data, session_id):
    data['session_id'] = session_id


def post_data(data):
    restclient = HttpClient(HOSTNAME + SENSOR_DATA_API_URL)
    return restclient.post_json_data(data)


def post_image(image):
    timestamp = int(os.path.basename(image).replace(IMG_FORMAT, ''))
    creation_time = datetime.datetime.fromtimestamp(timestamp)
    image_data = {'measure_time': creation_time, 'session_id': timestamp}
    restclient = HttpClient(HOSTNAME + IMAGES_API_URL)
    return restclient.post_file(image, image_data)


def get_images():
    images = []
    for image in glob.glob('*%s' % IMG_FORMAT):
        images.append(image)
    return images


def get_json_files():
    files = []
    for file in glob.glob('*.json'):
        files.append(file)
    return files


find_and_post_data()
