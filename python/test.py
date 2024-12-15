import configparser

config = configparser.ConfigParser()
config.read('./config.ini')

print(config.items()[0])
# name = config['CSICO']['name']

# print(f'name： {name}')