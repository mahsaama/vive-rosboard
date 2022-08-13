import os


def get_running_processes():
    tmp_filename = "/tmp/running_services_tmp.txt"
    os.system("systemctl list-units --type=service | cut -c3- | awk -F'.service' '{print $1}' >> %s" % (tmp_filename))
    # os.system("service --status-all | grep '\[ + \]' | cut -c9- >> %s" % (tmp_filename))
    with open(tmp_filename, "r", encoding="ISO-8859-1") as f:
        running_process = f.read().splitlines()[1:-7]
    running_process = [proc for proc in running_process if "vivebot" in proc]
    os.system("rm %s" % tmp_filename)
    return running_process


if __name__ == "__main__":
    print(get_running_processes())
