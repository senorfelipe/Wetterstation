from rest_framework import status
from rest_framework.test import APITestCase
from restapi.models import Wind, Temperature


class ObjectTests(APITestCase):
    def test_create_new_Wind(self):
        """
        Ensure we can create a new wind object.
        """
        data = {'speed': '18', 'direction': '73', 'time': '2020-05-09T23:15:30.000Z'}
        response = self.client.post("/api/wind/", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Wind.objects.count(), 1)
        self.assertEqual(Wind.objects.get().speed, '18.0')

    def test_create_new_Temperature(self):
        """
        Ensure we can create a new temperature object.
        """
        data = {'degrees': '5',  'time': '2020-05-09T23:17:42.000Z'}
        response = self.client.post("/api/temps/", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Temperature.objects.count(), 1)
        self.assertEqual(Temperature.objects.get().degrees, '5')
