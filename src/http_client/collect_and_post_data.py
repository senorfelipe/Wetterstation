import datetime
import glob
import http
import json
import logging
import os
import time
from json import JSONDecodeError
from random import random

from requests.exceptions import ConnectionError

from src.http_client.httpclient import HttpClient

IMG_FORMAT = '.jpeg'

SEARCH_DIR = './data/mock/'
HOSTNAME = 'http://localhost:8000'
SENSOR_DATA_API_URL = '/api/sensor-data/'
IMAGES_API_URL = '/api/images/'
MAX_JSON_POST_AMOUNT = 2000

logging.basicConfig(filename='raspi.log', level=logging.WARN)


def update_config(json_str):
    try:
        with open('config.json', 'r+') as config_file:
            current_config = sorted(json.load(config_file).items())
            requested_config = sorted(json.loads(json_str).items())
            if current_config != requested_config:
                config_file.seek(0)
                config_file.write(json_str)
                config_file.truncate()
    except JSONDecodeError:
        logging.warning("Could not deserialize config.json. Config.json is not up to date with server configuration.")


def set_config_applied():
    restclient = HttpClient(HOSTNAME + '/api/config-session/latest/')
    applied_json = {'applied': True}
    restclient.post_json_data(json=applied_json)


def check_configurations():
    try:
        restclient = HttpClient(HOSTNAME + '/api/config/latest/')
        response = restclient.get()
        if response[1] == http.HTTPStatus.OK:
            update_config(response[0])
            set_config_applied()
    except ConnectionError as e:
        logging.error('Could not setup connection to server: ' + str(e))


def find_and_post_data():
    os.chdir(SEARCH_DIR)
    files = get_json_files()
    to_post = []
    for file in files:
        if len(files) < MAX_JSON_POST_AMOUNT:
            with open(file) as json_file:
                data = json.load(json_file)
                add_session_id(data, os.path.splitext(file)[0])
                to_post.append(data)
    status = post_data(to_post)
    if status == 201:
        for file in to_post:
            os.remove(file)

    images = get_images()
    for image in images:
        img_path = image
        status = post_image(img_path)
        if status == 201:
            print('posted image: ' + os.path.basename(image))
            os.remove(img_path)
    os.chdir('../../')


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
        images.append(image)
    return images


def get_json_files():
    files = []
    for file in glob.glob('*.json'):
        files.append(file)
    return files


"""Workflow when this script runs:
It pulls the latst configuration parameters and updates the local config file. 
After that it posts the new sensor data."""
check_configurations()
find_and_post_data()
