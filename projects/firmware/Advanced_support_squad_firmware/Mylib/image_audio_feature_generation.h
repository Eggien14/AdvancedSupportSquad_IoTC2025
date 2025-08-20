/*
 * image_audio_feature_generation.h
 *
 *  Created on: Jul 28, 2025
 *      Author: Dell
 */

#ifndef MYLIB_IMAGE_AUDIO_FEATURE_GENERATION_H_
#define MYLIB_IMAGE_AUDIO_FEATURE_GENERATION_H_


#include <stdint.h>
#include <stddef.h>
#include <sl_status.h>
#include "tensorflow/lite/c/common.h"

#ifdef __cplusplus
extern "C" {
#endif

// Cấu hình kích thước spectrogram
#define IMAGE_WIDTH 50
#define IMAGE_HEIGHT 10
#define AUDIO_SLICE_SIZE 512 // Số mẫu 16-bit mỗi lần ghi vào buffer

// Khởi tạo mic
sl_status_t image_audio_feature_generation_init();

// Khởi tạo frontend để xử lý tín hiệu âm thanh
void image_audio_feature_generation_frontend_init(void);

void image_audio_feature_generation_write_audio_chunk(const int16_t* samples, size_t num_samples);

void image_audio_feature_generation_update_features(void);

sl_status_t image_audio_feature_generation_get_image_quantized(int8_t* image_buffer,
                                                        size_t buffer_size,
                                                        uint16_t range_min,
                                                        uint16_t range_max);

sl_status_t image_audio_feature_generation_get_image_dynamically_quantized(int8_t *image_buffer,
                                                                    size_t buffer_size,
                                                                    uint16_t dynamic_range);

void image_audio_feature_generation_get_image(float* image_buffer, size_t buffer_size);

TfLiteStatus image_audio_feature_generation_fill_tensor(TfLiteTensor* input_tensor);

void image_audio_feature_generation_reset(void);

int image_audio_feature_generation_get_unfetched_count(void);

bool image_audio_feature_generation_is_ready(void);

#ifdef __cplusplus
}
#endif

#endif /* MYLIB_IMAGE_AUDIO_FEATURE_GENERATION_H_ */
