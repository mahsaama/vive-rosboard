import os


def get_wifi_name(name="wlan0"):
    tmp_filename = "/tmp/wifi_tmp.txt"
    # print("iwconfig %s | grep ESSID | awk -F: '{print $2}' >> %s" % (name, tmp_filename))
    os.system("iwconfig %s | grep ESSID | awk -F: '{print $2}' >> %s" % (name, tmp_filename))
    with open(tmp_filename, "r") as f:
        wifi_name = f.readline()[1:-4]
        # print(wifi_name)
    os.system("rm %s" % tmp_filename)
    return wifi_name


def get_ip(name="wlan0"):
    tmp_filename = "/tmp/wifi_ip_tmp.txt"
    # print(" ip addr show %s | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1 >> %s " % (name, tmp_filename))
    os.system(" ip addr show %s | grep '\<inet\>' | awk \'{print $2}\' | awk -F '/' \'{print $1}\' >> %s " % (
    name, tmp_filename))
    # os.pop(" ip addr show %s | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1 >> %s " % (name, tmp_filename))

    with open(tmp_filename, "r") as f:
        wifi_name = f.readline()
        # print(wifi_name)
    os.system("rm %s" % tmp_filename)
    return wifi_name.strip()


if __name__ == '__main__':
    print(get_wifi_name("wlp3s0"))
    print(get_ip("wlp3s0"))
