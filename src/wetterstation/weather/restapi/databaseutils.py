import datetime
from math import ceil

from django.db.models import Func

MAX_DATASET_SIZE = 5


class UnixTimestamp(Func):
    """
    This class represents the mySQL function 'UNIX_TIMESTAMP'.
    You can use it like UnixTimestamp(...) in query expressions.
    """
    function = 'UNIX_TIMESTAMP'


class FromUnixtime(Func):
    """
    This class represents the mySQL function 'FROM_UNIXTIME'.
    You can use it like FromUnixtime(...) in query expressions.
    """
    function = 'FROM_UNIXTIME'


class Date(Func):
    """
    This class represents the mySQL function 'DATE'.
    You can use it like Date(...) in query expressions.
    """
    function = 'DATE'


def calculate_timedelta(start, end=datetime.datetime.now() + datetime.timedelta(days=1)):
    td = end - start
    td_sec = ceil(td.total_seconds() / (MAX_DATASET_SIZE - 1))
    return td_sec
