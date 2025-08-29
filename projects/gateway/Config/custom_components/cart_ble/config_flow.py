# Cho phép thêm thiết bị BLE bằng cách khai báo địa chỉ MAC trong device & service -> integration

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_ADDRESS
from .const import DOMAIN

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_ADDRESS): str,
})

class CartBLEConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1
    #
    async def async_step_user(self, user_input=None):
        if user_input is not None:
            #Tạo Config Entry (lưu trong .storage/core.config_entries)
            return self.async_create_entry(
                title=f"Cart BLE {user_input[CONF_ADDRESS]}",
                data=user_input
            )
        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA)