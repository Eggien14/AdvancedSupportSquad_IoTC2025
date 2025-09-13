/*
 * voice_detect.h
 *
 *  Created on: Jul 29, 2025
 *      Author: Dell
 */

#ifndef VOICE_DETECT_H_
#define VOICE_DETECT_H_


#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

// Hàm khởi tạo mô hình, frontend...
void voice_detect_init(void);

void get_voice_cmd(char* out, size_t out_size);

#ifdef __cplusplus
}
#endif


#endif /* VOICE_DETECT_H_ */
