import logging
import asyncio
import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA, SensorEntity
from homeassistant.const import CONF_ADDRESS
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, CoordinatorEntity
import homeassistant.helpers.config_validation as cv

from bleak import BleakClient, BleakError

from .const import DOMAIN, SENSOR_TYPES

_LOGGER = logging.getLogger(__name__)

CONF_CART = "cart"

# Cho phép khai báo sensor trong configuration.yaml
PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend({
    vol.Required(CONF_ADDRESS): cv.string,
    vol.Optional(CONF_CART): cv.positive_int,
})


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    """Setup cart_ble platform từ configuration.yaml."""
    address = config[CONF_ADDRESS]
    cart_id = config.get(CONF_CART)
    coordinator = CartCoordinator(hass, address)

    # Tạo task giữ kết nối BLE
    hass.loop.create_task(coordinator.async_start())

    entities = [
        CartBLESensor(coordinator, sensor_key, desc, cart_id)
        for sensor_key, desc in SENSOR_TYPES.items()
    ]
    async_add_entities(entities)


class CartCoordinator(DataUpdateCoordinator):
    """Giữ kết nối BLE tới EFR32 và nhận notify."""

    def __init__(self, hass, address: str):
        super().__init__(hass, _LOGGER, name="cart_ble", update_interval=None)
        self._hass = hass
        self._address = address
        self._client: BleakClient | None = None
        self._data: dict[str, str | None] = {}
        self._lock = asyncio.Lock()

    async def async_start(self):
        """Luôn giữ kết nối và subscribe notify, tự reconnect nếu mất."""
        while True:
            try:
                async with self._lock:
                    _LOGGER.info("Kết nối tới EFR32 @ %s ...", self._address)
                    self._client = BleakClient(self._address)
                    await self._client.connect()

                    if not self._client.is_connected:
                        raise BleakError("Không thể kết nối tới EFR32")

                    _LOGGER.info("Đã kết nối EFR32")

                    # Đăng ký notify và đọc initial value
                    for key, desc in SENSOR_TYPES.items():
                        uuid = desc["uuid"]

                        def _notify_handler(sender, data, key=key):
                            try:
                                try:
                                    val = data.decode("utf-8").strip()
                                except Exception:
                                    val = data.hex()

                                self._data[key] = val
                                self.async_set_updated_data(dict(self._data))
                                self.last_update_success = True
                                _LOGGER.debug("Notify %s = %s", key, val)
                            except Exception as e:
                                _LOGGER.warning("Lỗi parse notify %s: %s", key, e)

                        # đọc initial value
                        try:
                            val = await self._client.read_gatt_char(uuid)
                            try:
                                val = val.decode("utf-8").strip()
                            except Exception:
                                val = val.hex()
                            self._data[key] = val
                            self.async_set_updated_data(dict(self._data))
                            self.last_update_success = True
                            _LOGGER.info("Giá trị ban đầu %s = %s", key, val)
                        except Exception as e:
                            _LOGGER.warning("Không đọc được initial value %s: %s", key, e)

                        await self._client.start_notify(uuid, _notify_handler)
                        _LOGGER.info("Đã subscribe notify cho %s (%s)", key, uuid)

                    # Giữ kết nối tới khi mất
                    while self._client.is_connected:
                        await asyncio.sleep(1)

            except Exception as e:
                _LOGGER.error("Mất kết nối BLE: %s. Thử lại sau 5s", e)

            finally:
                if self._client:
                    try:
                        for desc in SENSOR_TYPES.values():
                            try:
                                await self._client.stop_notify(desc["uuid"])
                            except Exception:
                                pass
                        await self._client.disconnect()
                    except Exception:
                        pass
                self._client = None
                await asyncio.sleep(5)


class CartBLESensor(CoordinatorEntity, SensorEntity):
    """Entity BLE sensor nhận dữ liệu từ notify."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: CartCoordinator, key: str, desc: dict, cart_id: int | None = None):
        super().__init__(coordinator)
        self._key = key
        self._desc = desc
        self._cart_id = cart_id

        suffix = f"_{cart_id}" if cart_id else ""
        self._attr_name = f"{desc['name']}{suffix}"
        self._attr_unique_id = f"{coordinator._address}_{key}{suffix}"

    @property
    def native_value(self):
        data = self.coordinator.data
        if not data:
            return None
        return data.get(self._key)

    @property
    def available(self) -> bool:
        return bool(self.coordinator.data) and getattr(self.coordinator, "last_update_success", False)

    @property
    def device_info(self):
        """Nhóm 3 sensor vào cùng một device nếu có cart_id."""
        identifiers = (DOMAIN, f"{self.coordinator._address}_{self._cart_id}") if self._cart_id else (DOMAIN, self.coordinator._address)
        name = f"Cart BLE {self._cart_id}" if self._cart_id else f"Cart BLE {self.coordinator._address}"

        return {
            "identifiers": {identifiers},
            "name": name,
            "manufacturer": "EFR32",
            "model": "EFR32xG26",
        }
