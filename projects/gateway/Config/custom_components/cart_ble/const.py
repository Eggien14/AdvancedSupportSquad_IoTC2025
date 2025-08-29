DOMAIN = "cart_ble"

# Characteristic UUID
CHAR_UUID_POSITION = "11111111-1111-1111-1111-111111111111"
CHAR_UUID_STATE    = "22222222-2222-2222-2222-222222222222"
CHAR_UUID_VOICE    = "33333333-3333-3333-3333-333333333333"

SENSOR_TYPES = {
    "cart_position": {
        "name": "Cart Position",
        "uuid": CHAR_UUID_POSITION,
        "unit": None,
    },
    "cart_state": {
        "name": "Cart State",
        "uuid": CHAR_UUID_STATE,
        "unit": None,
    },
    "cart_voice_cmd": {
        "name": "Cart Voice Command",
        "uuid": CHAR_UUID_VOICE,
        "unit": None,
    },
}