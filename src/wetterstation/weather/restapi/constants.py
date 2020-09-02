"""
Contains global constatns, which can be adapted by changing its value.
"""

"""IPv4 Adress of Raspi to verify the post request"""
RASPI_IP_ADDR = '127.0.0.1'

"""This number sets the aggregation intervall of requested wind values."""
WIND_AGGREGATION_INTERVALL_IN_MIN = 15

"""This variable sets the number of datapoints for aggregation. 
For exapmle if the original table contains 1200 data sets for a certain query, the request for the aggregated data
only contains 50 data sets."""
MAX_DATASET_SIZE = 50
