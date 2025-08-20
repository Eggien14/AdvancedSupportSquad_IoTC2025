/*
 * voice_push_to_talk.c
 *
 *  Created on: Aug 19, 2025
 *      Author: Dell
 */


#include <stdbool.h>
#include "voice_push_to_talk.h"

static volatile bool status_ptt_on = false;

void voice_push_to_talk_set(bool on) {
  status_ptt_on = on;
}

bool voice_push_to_talk_get(void) {
  return status_ptt_on;
}


