import os


def get_usb():
    tmp_filename = "/tmp/usb_tmp.txt"
    password = "vive2022"
    dev_size = {}
    os.system("echo %s | sudo -S fdisk -l | grep '^/dev/s[^ ]*' | awk '{print $1, $2, $6}' >> %s" % (password, tmp_filename))
    with open(tmp_filename, "r") as f:
        devs = f.read().splitlines()
    for dev in devs:
        if dev.split()[1] == "*":
            dev_size[dev.split()[0]] = dev.split()[2]
    os.system("rm %s" % tmp_filename)
    return dev_size


if __name__ == "__main__":
    print(get_usb())
