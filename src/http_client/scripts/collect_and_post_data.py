import datetime
import glob
import http
import json
import logging
import os
import time
from json import JSONDecodeError
from random import random

import requests
from requests.exceptions import ConnectionError

IMG_FORMAT = '.jpeg'

BASE_DIR = os.getcwd()
DATA_DIR = '../data/processed/'
HOSTNAME = 'http://84.146.24.145:9081'
SENSOR_DATA_API_URL = '/api/sensor-data/'
IMAGES_API_URL = '/api/images/'
MAX_JSON_POST_AMOUNT = 2000
MAX_IMAGE_POST_AMOUNT = 200

logging.basicConfig(filename='../raspi.log', level=logging.WARN, format='%(asctime)s: %(levelname)s; %(message)s')


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


def check_configurations():
    try:
        restclient = HttpClient(HOSTNAME + '/api/config/latest/')
        response = restclient.get()
        if len(response[0]) != 0 and response[1] == http.HTTPStatus.OK:
            update_config(response[0])
    except ConnectionError as e:
        logging.error('Could not setup connection to server: ' + str(e))


def update_config(pulled_config_str):
    try:
        with open('../config/config.json', 'r+') as config_file:
            current_config = sorted(json.load(config_file).items())
            requested_config = sorted(json.loads(pulled_config_str).items())
            if current_config != requested_config:
                config_file.seek(0)
                config_file.write(pulled_config_str)
                config_file.truncate()
                set_config_applied()
    except JSONDecodeError:
        logging.warning("Could not deserialize config.json. Config.json is not up to date with server configuration.")


def set_config_applied():
    restclient = HttpClient(HOSTNAME + '/api/config-session/latest/')
    applied_json = {'applied': True}
    restclient.post_json_data(json=applied_json)


def find_and_post_data():
    os.chdir(DATA_DIR)
    os.chdir('./sensor/')
    post_json_files()
    os.chdir('../images/')
    post_imges()
    os.chdir(BASE_DIR)


def post_imges():
    images = get_images()
    for image in images:
        img_path = image
        status = post_image(img_path)
        if status == 201:
            os.remove(img_path)


def post_json_files():
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


def create_session_id():
    return time.time_ns() + int(random() * 100)


def add_session_id(data, session_id):
    data['session_id'] = session_id


def post_data(data):
    if len(data) > 0:
        try:
            restclient = HttpClient(HOSTNAME + SENSOR_DATA_API_URL)
            return restclient.post_json_data(data)
        except ConnectionError as e:
            logging.error('Could not setup connection to server: ' + str(e))
    else:
        logging.info('Received no data to post.')


def post_image(image):
    try:
        timestamp = int(os.path.basename(image).replace(IMG_FORMAT, ''))
        creation_time = datetime.datetime.fromtimestamp(timestamp)
        image_data = {'measure_time': creation_time, 'session_id': timestamp}
        restclient = HttpClient(HOSTNAME + IMAGES_API_URL)
        return restclient.post_file(image, image_data)
    except ConnectionError as e:
        logging.error('Could not setup connection to server: ' + str(e))


def get_images():
    images = []
    for image in glob.glob('*%s' % IMG_FORMAT):
        if len(images) < MAX_IMAGE_POST_AMOUNT:
            images.append(image)
    return images


def get_json_files():
    files = []
    for file in glob.glob('*.json'):
        if len(files) < MAX_JSON_POST_AMOUNT:
            files.append(file)
    return files


"""Workflow when this script runs:
It pulls the latst configuration parameters and updates the local config file. 
After that it posts the new sensor data."""
check_configurations()
find_and_post_data()
