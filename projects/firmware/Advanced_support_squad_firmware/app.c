/***************************************************************************//**
 * @file
 * @brief Core application logic.
 *******************************************************************************
 * # License
 * <b>Copyright 2024 Silicon Laboratories Inc. www.silabs.com</b>
 *******************************************************************************
 *
 * SPDX-License-Identifier: Zlib
 *
 * The licensor of this software is Silicon Laboratories Inc.
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 *
 ******************************************************************************/
#include <stdio.h>



#include "sl_common.h"
#include "sl_bt_api.h"
#include "app_assert.h"
#include "app.h"
#include "gatt_db.h"
#include "sl_udelay.h"



#include "config.h"
#include "target_tracking_handler.h"



#include "app.h"
#include "app_btn.h"
#include "voice_detect.h"



/******************************************************************************************//**
 *
 * Global variable define
 *
 *********************************************************************************************/

AnchorReading_t anchor_readings[NUM_ANCHORS] = {
    { .mac_beacon = { BEACON_MACS[0][0], BEACON_MACS[0][1], BEACON_MACS[0][2],
               BEACON_MACS[0][3], BEACON_MACS[0][4], BEACON_MACS[0][5] },
      .raw_rssi = -50.0 },

    { .mac_beacon = { BEACON_MACS[1][0], BEACON_MACS[1][1], BEACON_MACS[1][2],
               BEACON_MACS[1][3], BEACON_MACS[1][4], BEACON_MACS[1][5] },
      .raw_rssi = -50.0 },

    { .mac_beacon = { BEACON_MACS[2][0], BEACON_MACS[2][1], BEACON_MACS[2][2],
               BEACON_MACS[2][3], BEACON_MACS[2][4], BEACON_MACS[2][5] },
      .raw_rssi = -50.0 },

    { .mac_beacon = { BEACON_MACS[3][0], BEACON_MACS[3][1], BEACON_MACS[3][2],
               BEACON_MACS[3][3], BEACON_MACS[3][4], BEACON_MACS[3][5] },
      .raw_rssi = -50.0 }
};



/**************************************************************************//**

 *****************************************************************************/
// The advertising set handle allocated from Bluetooth stack.
static uint8_t advertising_set_handle = 0xff;

// Application Init.
SL_WEAK void app_init(void)
{
  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  // BLE setup                                                               //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  printf("System started\r\n");

  app_btn_init();

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  // Target tracking                                                         //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  target_tracking_setup();


  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  // Voice_init                                                         //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  voice_detect_init();
}

// Application Process Action.
SL_WEAK void app_process_action(void)
{
  app_btn_process();
  if (app_is_process_required()) {
    /////////////////////////////////////////////////////////////////////////////
    // Put your additional application code here!                              //
    // This is will run each time app_proceed() is called.                     //
    // Do not call blocking functions from here!                               //
    /////////////////////////////////////////////////////////////////////////////
    target_tracking();
  }
}

/**************************************************************************//**
 * Bluetooth stack event handler.
 * This overrides the dummy weak implementation.
 *
 * @param[in] evt Event coming from the Bluetooth stack.
 *****************************************************************************/
void sl_bt_on_event(sl_bt_msg_t *evt)
{
  sl_status_t sc;

  switch (SL_BT_MSG_ID(evt->header)) {
    // -------------------------------
    // This event indicates the device has started and the radio is ready.
    // Do not call any stack command before receiving this boot event!
    case sl_bt_evt_system_boot_id:
      // Create an advertising set.
      sc = sl_bt_advertiser_create_set(&advertising_set_handle);
      app_assert_status(sc);

      // Generate data for advertising
      sc = sl_bt_legacy_advertiser_generate_data(advertising_set_handle,
                                                 sl_bt_advertiser_general_discoverable);
      app_assert_status(sc);

      // Set advertising interval to 100ms.
      sc = sl_bt_advertiser_set_timing(
        advertising_set_handle,
        160, // min. adv. interval (milliseconds * 1.6)
        160, // max. adv. interval (milliseconds * 1.6)
        0,   // adv. duration
        0);  // max. num. adv. events
      app_assert_status(sc);

      // Start advertising and enable connections.
      sc = sl_bt_legacy_advertiser_start(advertising_set_handle,
                                         sl_bt_legacy_advertiser_connectable);
      printf("[BLE]: Start advertising ...\n");
      app_assert_status(sc);

      // Start scanning
      sc = sl_bt_scanner_start(sl_bt_scanner_scan_phy_1m,
                               sl_bt_scanner_discover_generic);
      printf("BLE scan start\r\n");
      break;

    // -------------------------------
    // This event indicates that a new connection was opened.
    case sl_bt_evt_connection_opened_id:

//      notify_enabled = false;
//      connection = evt->data.evt_connection_opened.connection;
//      //Start timer and app_timer_callback
//      sl_sleeptimer_start_periodic_timer_ms(&app_timer,
//                                            TIMER_INTERVAL_MS,
//                                            app_timer_callback,
//                                            NULL,
//                                            0,
//                                            0);
      break;

    // -------------------------------
    // This event indicates that a connection was closed.
    case sl_bt_evt_connection_closed_id:
      // Generate data for advertising

//      sl_sleeptimer_stop_timer(&app_timer);

      sc = sl_bt_legacy_advertiser_generate_data(advertising_set_handle,
                                                 sl_bt_advertiser_general_discoverable);
      app_assert_status(sc);

      // Restart advertising after client has disconnected.
      sc = sl_bt_legacy_advertiser_start(advertising_set_handle,
                                         sl_bt_legacy_advertiser_connectable);
      app_assert_status(sc);
      break;

    ///////////////////////////////////////////////////////////////////////////
    // Add additional event handlers here as your application requires!      //
    ///////////////////////////////////////////////////////////////////////////

    //Handle advertisement event
    case sl_bt_evt_scanner_legacy_advertisement_report_id:
      bd_addr addr = evt->data.evt_scanner_legacy_advertisement_report.address;
      int8_t rssi = evt->data.evt_scanner_legacy_advertisement_report.rssi;

       //Filter RSSI based on beacon MAC address
      if (memcmp(addr.addr, anchor_readings[0].mac_beacon, 6) == 0) {
          anchor_readings[0].raw_rssi = rssi;
          update_rssi_buffer(0, anchor_readings[0].raw_rssi);
      }
      else if (memcmp(addr.addr, anchor_readings[1].mac_beacon, 6) == 0) {
          anchor_readings[1].raw_rssi = rssi;
          update_rssi_buffer(1, anchor_readings[1].raw_rssi);
      }
      else if (memcmp(addr.addr, anchor_readings[2].mac_beacon, 6) == 0) {
          anchor_readings[2].raw_rssi = rssi;
          update_rssi_buffer(2, anchor_readings[2].raw_rssi);
      }
      else if (memcmp(addr.addr, anchor_readings[3].mac_beacon, 6) == 0) {
          anchor_readings[3].raw_rssi = rssi;
          update_rssi_buffer(3, anchor_readings[3].raw_rssi);
      }
      app_proceed(); // đánh thức task xử lý target_tracking
      break;

//      //Evt: GATT server's characteristic has been changed
//      case sl_bt_evt_gatt_server_characteristic_status_id:
//        if (evt->data.evt_gatt_server_characteristic_status.status_flags == sl_bt_gatt_server_client_config) {
//          if (evt->data.evt_gatt_server_characteristic_status.client_config_flags == sl_bt_gatt_notification) {
//            notify_enabled = true;
//            app_log("Notify enabled by client.\n");
//          } else {
//            notify_enabled = false;
//            app_log("Notify disabled by client.\n");
//          }
//        }
//        break;
//
//       //Evt: Handle write request from GATT client
//      case sl_bt_evt_gatt_server_user_write_request_id:
//        if (evt->data.evt_gatt_server_user_write_request.characteristic == gattdb_pi4_message) {
//            size_t message_len = evt->data.evt_gatt_server_user_write_request.value.len;
//            memcpy(pi4_receive_message, evt->data.evt_gatt_server_user_write_request.value.data, message_len);
//            pi4_receive_message[message_len] = '\0';
//  //          app_log("Receive message: %.*s\n", (int)message_len, pi4_receive_message);
//            app_log("Receive message: %s\n", pi4_receive_message);
//        }
//
//        sc = sl_bt_gatt_server_send_user_write_response(evt->data.evt_gatt_server_user_write_request.connection,
//                                                       evt->data.evt_gatt_server_user_write_request.characteristic,
//                                                       SL_STATUS_OK);
//        app_assert_status(sc);
//        break;
//
    // -------------------------------
    // Default event handler.
    default:
      break;
  }
}
