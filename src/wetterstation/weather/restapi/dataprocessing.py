import logging

logger = logging.getLogger(__name__)

# constants to ensure data mapping
RASPI_TIME_KEY = 'timestampIso'
RASPI_TEMPERATURE_KEY = 'temp'
RASPI_SESSION_ID_KEY = 'session_id'

KEY_MAPPING_DICT = {
    'deg': 'degrees',
    'dir': 'direction',
    'pv': 'solar_cell'
}

VALIDATION_INTERVALLS = {
    'temperature': (-50, 70),
    'direction': (0, 360),
    'speed': (0, 120),
    'current': (0, 3),
    'voltage': (0, 30),
    'power': (0, 60)
}


def add_timestamps_and_session_ids(mapped, time, session_id):
    for key, value in list(mapped.items()):
        if isinstance(value, dict):
            value['measure_time'] = time
            value['measurement_session'] = session_id


def map_keys(data):
    for key, value in list(data.items()):
        if key in KEY_MAPPING_DICT:
            data[KEY_MAPPING_DICT[key]] = data.pop(key)
        if isinstance(value, dict):
            map_keys(value)


def cast_types(data):
    for key, value in list(data.items()):
        if isinstance(value, dict):
            cast_types(value)
        if isinstance(value, str) and key != 'mode':
            try:
                data[key] = float(value)
            except ValueError:
                if value == "err":
                    data[key] = None


def cast_units(values_dict):
    for el in values_dict:
        for key, value in list(el.items()):
            if key in ('current', 'voltage') and value is not None:
                el[key] = round(value / 1000, 2)


def map_sensor_data(data, session_id):
    """
    Ensures data mapping to fit database schema.
    Therefore is takes the post format of the raspi as input and mappes it to the proper database format.
    """
    mapped = create_basic_dict(data)
    add_timestamps_and_session_ids(mapped, data[RASPI_TIME_KEY], session_id)
    map_keys(mapped)
    cast_types(mapped)
    cast_units(list(mapped.values()))
    return mapped


def create_basic_dict(data):
    mapped = dict()
    mapped['temperature'] = {'degrees': data['weather'][RASPI_TEMPERATURE_KEY]}
    mapped['wind'] = {'direction': data['weather']['windDir'], 'speed': data['weather']['windSpeed']}
    for key, value in list(data['energy'].items()):
        mapped[key] = value
    return mapped


def check_intervall(key, val):
    if key in VALIDATION_INTERVALLS:
        intervall = VALIDATION_INTERVALLS[key]
        if val is not None:
            if val <= intervall[0] or val >= intervall[1]:
                raise ValueError(key + " with its value '" + str(val) + "' is not within the valid intervall.")


def validate(data):
    for value in data.values():
        if isinstance(value, dict):
            try:
                for key, val in value.items():
                    check_intervall(key, val)
            except ValueError as e:
                logger.error("Validation failed with message: " + str(e))
