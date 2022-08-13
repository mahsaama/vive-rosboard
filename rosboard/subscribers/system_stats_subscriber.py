#!/usr/bin/env python3

try:
    import psutil
except (ImportError, ModuleNotFoundError) as e:
    psutil = None

import time
import threading
import traceback

from rosboard.utils.running_services_utils import get_running_processes
from rosboard.utils.wifi_utils import get_wifi_name, get_ip
from rosboard.utils.usb_utils import get_usb


def mean(list):
    return sum(list)/len(list)


class SystemStatsSubscriber(object):
    def __init__(self, callback, net_name="wlan0"):
        self.callback = callback
        self.net_name = net_name
        self.stop = False
        threading.Thread(target = self.start, daemon = True).start()

    def __del__(self):
        self.stop = True
        pass

    def unregister(self):
        self.stop = True
        pass

    def start(self):
        if psutil is None:
            self.callback({"_error": "Please install psutil (sudo pip3 install --upgrade psutil) to use this feature."})
            return

        while not self.stop:
            try:
                p = psutil.Process()

                with p.oneshot():
                    sensors_temperatures = psutil.sensors_temperatures()
                    cpu_percent = psutil.cpu_percent(percpu=True)
                    net_io_counters = psutil.net_io_counters()
                    virtual_memory = psutil.virtual_memory()
                    swap_memory = psutil.swap_memory()
                    disk_usage = psutil.disk_usage('/')

                status = {}

                status["IP"] = get_ip(self.net_name)
                status["SSID"] = get_wifi_name(self.net_name).replace('"', '')
                status["cpu_percent"] = cpu_percent

                if "coretemp" in sensors_temperatures:
                    status["temp_coretemp"] = mean(list(map(
                        lambda x:x.current,
                        sensors_temperatures["coretemp"]
                    )))
                if "thermal-fan-est" in sensors_temperatures:
                    status["temp_coretemp"] = mean(list(map(
                        lambda x:x.current,
                        sensors_temperatures["thermal-fan-est"]
                    )))

                status["net_bytes_sent"] = net_io_counters.bytes_sent
                status["net_bytes_recv"] = net_io_counters.bytes_recv

                status["disk_usage_percent"] = disk_usage.percent
                status["disk_usage_total"] = disk_usage.total / 1024.0 / 1024.0 / 1024.0
                status["disk_usage_free"] = disk_usage.free / 1024.0 / 1024.0 / 1024.0

                status["virtual_memory_percent"] = virtual_memory.percent
                status["virtual_memory_total"] = virtual_memory.total / 1024.0 / 1024.0 / 1024.0
                status["virtual_memory_available"] = virtual_memory.available / 1024.0 / 1024.0 / 1024.0

                status["swap_memory_percent"] = swap_memory.percent
                status["Running Services"] = get_running_processes()
                # status["USB"] = get_usb()
            except Exception as e:
                traceback.print_exc()

            self.callback(status)
            time.sleep(3)


if __name__ == "__main__":
    # Run test
    SystemStatsSubscriber(lambda msg: print("Received msg: %s" % msg), net_name="wlp3s0")
    time.sleep(100)
