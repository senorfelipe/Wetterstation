import datetime
import glob
import json
import os

from src.http_client.httpclient import HttpClient

SEARCH_DIR = '.'
HOSTNAME = 'http://localhost:8000'
SENSOR_DATA_API_URL = '/api/sensor-data'
IMAGES_API_URL = '/api/images/'


def find_and_post_data():
    files = get_json_files()
    to_remove = []
    for file in files:
        with open(file) as json_file:
            status = post_json(json_file)
            if status == 201:
                to_remove.append(file)
        if file in to_remove:
            print('removed: ' + file)
            os.remove(file)

    images = get_images()
    for image in images:
        status = post_image(image)
        if status == 201:
            os.remove(image)


def post_json(json_file):
    data = json.load(json_file)
    restclient = HttpClient(HOSTNAME + SENSOR_DATA_API_URL)
    return restclient.post_json_data(data)


def post_image(image):
    timestamp = int(os.path.basename(image).replace('.jpg', ''))
    creation_time = datetime.datetime.fromtimestamp(timestamp)
    image_data = {'time': creation_time}
    restclient = HttpClient(HOSTNAME + IMAGES_API_URL)
    return restclient.post_file(image, image_data)


def get_images():
    os.chdir(SEARCH_DIR)
    images = []
    for image in glob.glob('*.jpg'):
        images.append(image)
    return images


def get_json_files():
    os.chdir(SEARCH_DIR)
    files = []
    for file in glob.glob('*.json'):
        files.append(file)
    return files


find_and_post_data()
