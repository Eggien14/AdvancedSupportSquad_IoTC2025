/*
 * voice_push_to_talk.h
 *
 *  Created on: Aug 19, 2025
 *      Author: Dell
 */

#ifndef MYLIB_VOICE_PUSH_TO_TALK_H_
#define MYLIB_VOICE_PUSH_TO_TALK_H_


#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

void voice_push_to_talk_set(bool on);

bool voice_push_to_talk_get(void);

#ifdef __cplusplus
}
#endif


#endif /* MYLIB_VOICE_PUSH_TO_TALK_H_ */
