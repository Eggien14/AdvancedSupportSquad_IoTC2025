/*
 * app_btn.c
 *
 *  Created on: Aug 19, 2025
 *      Author: Dell
 */


#include <stdbool.h>
#include "sl_simple_button_instances.h"
#include "sl_button.h"
#include "sl_simple_led_instances.h"
#include "sl_sleeptimer.h"
#include "Mylib/voice_push_to_talk.h"

#define BTN_DEBOUNCE_MS   30


static volatile bool btn0_pressed = false;

static volatile bool btn0_pending        = false;

static volatile bool btn0_debounce_elapsed = false;


static sl_sleeptimer_timer_handle_t btn0_db_timer;

static void btn0_db_timer_callback(sl_sleeptimer_timer_handle_t *timer, void *data)
{
  (void)timer;
  (void)data;
  // Báo đã hết thời gian debounce
  btn0_debounce_elapsed = true;
}

void sl_button_on_change(const sl_button_t *handle)
{
  if (handle != &sl_button_btn0) {
    return;
  }

  sl_button_state_t st = sl_button_get_state(handle);
  btn0_pressed = (st == SL_SIMPLE_BUTTON_PRESSED);
  btn0_pending = true;
  btn0_debounce_elapsed = false;

  // Khởi động debounce timer 30ms
  sl_sleeptimer_stop_timer(&btn0_db_timer);
  (void)sl_sleeptimer_start_timer_ms(&btn0_db_timer,
                                     BTN_DEBOUNCE_MS,
                                     btn0_db_timer_callback,
                                     NULL,
                                     0,
                                     0);
}

void app_btn_init(void)
{
  sl_led_turn_off(&sl_led_led0);
  voice_push_to_talk_set(false);
}

void app_btn_process(void)
{
  // Xử lý khi có thay đổi và đã hết debounce
  if (!btn0_pending || !btn0_debounce_elapsed) {
    return;
  }

  // Đọc lại trạng thái thực tế để xác nhận ổn định
  sl_button_state_t status_now = sl_button_get_state(&sl_button_btn0);
  bool pressed_now = (status_now == SL_SIMPLE_BUTTON_PRESSED);

  if (pressed_now == btn0_pressed) {
    // Trạng thái ổn định
    if (pressed_now) {
      voice_push_to_talk_set(true);
      sl_led_turn_on(&sl_led_led0);
    } else {
      voice_push_to_talk_set(false);
      sl_led_turn_off(&sl_led_led0);
    }
    btn0_pending = false;
  } else {
    // Chưa ổn định
    btn0_debounce_elapsed = false;
  }
}
