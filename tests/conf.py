try:
    import configparser  # python 3
except ImportError:
    import ConfigParser  # python 2

    configparser = ConfigParser

config = configparser.ConfigParser()

config.read("marathon.ini")


def config_section_map(section):
    dict_params = {}
    options = config.options(section)
    for option in options:
        try:
            dict_params[option] = config.get(section, option)
            if dict_params[option] == -1:
                print("skip: %s" % option)
        except Exception:
            print("exception on %s!" % option)
            dict_params[option] = None
    return dict_params


class ConfigMarathon:
    browser = config_section_map("Main")['browser']
    host = config_section_map("Marathon")['hostname']
    port = config_section_map("Marathon")['port']


    @classmethod
    def main_url(cls):
        return cls.host + ":" + cls.port
