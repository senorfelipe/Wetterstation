import json
import os
from datetime import datetime, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from .dataprocessing import validate
from .models import Wind, Temperature, Battery, SolarCell, MeasurementSession
from .views import map_sensor_data

TEST_DATA_DIR = 'testdata/name.json'


def get_test_file(filename):
    script_dir = os.path.dirname(__file__)  # <-- absolute dir the script is in
    abs_test_data_path = os.path.join(script_dir, TEST_DATA_DIR.replace('name', filename))
    test_file = open(abs_test_data_path)
    return test_file


class TestSensorDataPost(APITestCase):
    def test_sensor_data_was_posted(self):
        test_file = get_test_file()
        data = json.load(test_file)
        post = [data]
        response = self.client.post('/api/sensor-data/', data=post, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wind.objects.count(), 1)
        self.assertEqual(Temperature.objects.count(), 1)
        self.assertEqual(Battery.objects.count(), 1)
        self.assertEqual(SolarCell.objects.count(), 1)
        self.assertEqual(MeasurementSession.objects.count(), 1)

        self.assertEqual(Temperature.objects.get().degrees, 20.5)
        self.assertEqual(Wind.objects.get().speed, 1.5)

    def test_senor_data_mapping(self):
        data = json.load(get_test_file('unmapped'))
        session_id = int(data['session_id'])
        session = MeasurementSession(session_id=session_id)
        mapped = map_sensor_data(data, session.session_id)

        temp_dict = mapped['temperature']
        with self.assertRaises(KeyError):
            temp_dict['deg']
        self.assertIsNotNone(temp_dict['degrees'], 'Temperature dict was not mapped correctly.')
        print(mapped)
        validate(mapped)
        self.assertEqual(get_test_file('mapped'), mapped)

    def test_query_by_time(self):
        time_1 = datetime.now() - timedelta(days=5)
        temp_1 = Temperature(degrees=10, measurement_session=None, measure_time=time_1)
        temp_1.save()

        time_2 = datetime.now()
        temp_2 = Temperature(degrees=10, measurement_session=None, measure_time=time_2)
        temp_2.save()

        self.assertEqual(Temperature.objects.count(), 2)

        start = datetime.now() - timedelta(10)
        filtered_temps = self.client.get('/api/temps/?start=' + str(start))
        self.assertEqual(len(filtered_temps.data), 2)

        end = datetime.now() - timedelta(2)
        filtered_temps = self.client.get('/api/temps/?start=' + str(start) + '&end=' + str(end))
        self.assertEqual(len(filtered_temps.data), 1)


class TestDataAggregation(APITestCase):

    def setUp(self):
        pass

    def test_aggregation_was_correct(self):
        pass
