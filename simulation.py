import paho.mqtt.client as mqtt
import ssl, time, random

BROKER = "c86263fdc7524d05a78ad0b242b6aa79.s1.eu.hivemq.cloud"
PORT = 8883
USER = "admin"
PWD = "Si12345678#"

zones = {
    "zone1": (20, 40),
    "zone2": (40, 60),
    "zone3": (60, 80),
    "zone4": (10,20)
}

client = mqtt.Client()
client.username_pw_set(USER, PWD)
client.tls_set_context(ssl.create_default_context())
client.connect(BROKER, PORT)
client.loop_start()

print("Pret")

try:
    while True:
        for zone, (min_v, max_v) in zones.items():
            val = random.randint(min_v, max_v)
            client.publish(f"jardin/{zone}/humidite", val)
            print(zone, val)
        time.sleep(5)
except KeyboardInterrupt:
    client.loop_stop()
    client.disconnect()
