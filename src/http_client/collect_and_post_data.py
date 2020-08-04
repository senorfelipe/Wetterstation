import datetime
import glob
import json
import os

from src.http_client.httpclient import HttpClient

IMG_FORMAT = '.jpeg'

SEARCH_DIR = './../data/processed/'
SENSOR_DIR = './sensor'
IMAGES_DIR = './images'

CONFIG_DIR = './config/'
HOSTNAME = 'http://localhost:8000'
SENSOR_DATA_API_URL = '/api/sensor-data/'
IMAGES_API_URL = '/api/images/'

MAX_POST_SIZE = 1000


def find_and_post_data():
    os.chdir(SEARCH_DIR)
    files = get_json_files()
    to_post = []
    for file in files:
        if len(to_post) >= MAX_POST_SIZE:
            break
        with open(file) as json_file:
            data = json.load(json_file)
            add_session_id(data, os.path.splitext(file)[0])
            to_post.append(data)
    status = post_data(to_post)
    if status == 201:
        for file in files:
            os.remove(file)
    os.chdir('./../')

    images = get_images()
    for image in images:
        img_path = image
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
    os.chdir(IMAGES_DIR)
    images = []
    for image in glob.glob('*%s' % IMG_FORMAT):
        images.append(image)
    return images


def get_json_files():
    os.chdir(SENSOR_DIR)
    files = []
    for file in glob.glob('*.json'):
        files.append(file)
    return files


find_and_post_data()
