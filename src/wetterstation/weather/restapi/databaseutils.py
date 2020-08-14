import datetime
from math import ceil

from django.db.models import Func

"""This variable sets the number of datapoints for aggregation. 
For exapmle if the original table contains 1200 data sets for a certain query, the request for the aggregated data
only contains 50 data sets."""
MAX_DATASET_SIZE = 50


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
