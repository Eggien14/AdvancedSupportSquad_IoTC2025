/*
 * image_audio_feature_generation.c
 *
 *  Created on: Jul 28, 2025
 *      Author: Dell
 */



#include "image_audio_feature_generation.h"
#include <stdio.h>
#include <assert.h>
#include <math.h>
#include "sl_common.h"
#include "frontend.h"
#include "frontend_util.h"
#include "window_util.h"
#include <string.h>
#include <assert.h>

#define AUDIO_CHUNK_SIZE     AUDIO_SLICE_SIZE                   // Mỗi chunk là 512 mẫu
#define AUDIO_BUFFER_SIZE    (IMAGE_WIDTH * AUDIO_SLICE_SIZE)   // 50 x 512 = 25600 mẫu
#define FEATURE_BUFFER_SIZE  (IMAGE_WIDTH * IMAGE_HEIGHT)

// Buffer âm thanh và chỉ số quản lý vòng đệm
static int16_t audio_buffer[AUDIO_BUFFER_SIZE];
static volatile size_t audio_write_index = 0;
static volatile size_t audio_read_index = 0;
static volatile size_t feature_buffer_start;

// Buffer đặc trưng và chỉ số
static uint16_t feature_buffer[FEATURE_BUFFER_SIZE];
static volatile size_t feature_index = 0;
static size_t num_unfetched_slices = 0;

// Biến kiểm soát inference chạy 1 lần
static bool image_ready = false;


// Frontend xử lý
static struct FrontendState frontend_state;

// ======================================
// === Hàm khởi tạo frontend ============
void image_audio_feature_generation_frontend_init(void)
{
  memset(audio_buffer, 0, sizeof(audio_buffer));
  memset(feature_buffer, 0, sizeof(feature_buffer));
  audio_write_index = 0;
  audio_read_index = 0;
  feature_index = 0;
  num_unfetched_slices = 0;

  struct FrontendConfig config;
  config.window.size_ms = 30;
  config.window.step_size_ms = 20;

  config.filterbank.num_channels = IMAGE_HEIGHT;
  config.filterbank.lower_band_limit = 125.0f;
//  config.filterbank.upper_band_limit = 7500.0f;
  config.filterbank.upper_band_limit = 4000.0f;
  config.filterbank.output_scale_shift = 0;

  config.noise_reduction.enable_noise_reduction = 1;
  config.noise_reduction.smoothing_bits = 10;
  config.noise_reduction.even_smoothing = 0.025f;
  config.noise_reduction.odd_smoothing = 0.06f;
  config.noise_reduction.min_signal_remaining = 0.05f;

  config.pcan_gain_control.enable_pcan = 1;
  config.pcan_gain_control.strength = 0.95f;
  config.pcan_gain_control.offset = 80.0f;
  config.pcan_gain_control.gain_bits = 21;

  config.log_scale.enable_log = 1;
  config.log_scale.scale_shift = 6;

  FrontendPopulateState(&config, &frontend_state, 16000);
}

// ======================================
// === Ghi 1 chunk âm thanh ============
void image_audio_feature_generation_write_audio_chunk(const int16_t* samples, size_t num_samples)
{
  if (num_samples != AUDIO_CHUNK_SIZE) return; // chỉ ghi đúng size đã định

  for (size_t i = 0; i < num_samples; ++i) {
    audio_buffer[audio_write_index] = samples[i];
    audio_write_index = (audio_write_index + 1) % AUDIO_BUFFER_SIZE;

    // LOG DEBUG
//    printf("write_audio(): write_index = %u, num_samples = %u\n", audio_write_index, num_samples);

  }
}

// ======================================
// === Xử lý tạo ảnh đặc trưng ==========
void image_audio_feature_generation_update_features(void)
{
  size_t num_samples_available = (audio_write_index >= audio_read_index)
                                ? (audio_write_index - audio_read_index)
                                : (AUDIO_BUFFER_SIZE - audio_read_index + audio_write_index);

  size_t num_slices_generated = 0;

  while (num_samples_available >= AUDIO_CHUNK_SIZE && feature_index < IMAGE_WIDTH) {
    size_t samples_to_read = AUDIO_CHUNK_SIZE;
    const int16_t* chunk_ptr = &audio_buffer[audio_read_index];

    size_t num_samples_read = 0;
    struct FrontendOutput output = FrontendProcessSamples(
        &frontend_state, chunk_ptr, samples_to_read, &num_samples_read);

    audio_read_index = (audio_read_index + num_samples_read) % AUDIO_BUFFER_SIZE;
    num_samples_available -= num_samples_read;

    if (output.values != NULL && output.size == IMAGE_HEIGHT) {
      for (int i = 0; i < IMAGE_HEIGHT; i++) {
        feature_buffer[feature_index * IMAGE_HEIGHT + i] = output.values[i];
      }
      feature_index++;
      num_slices_generated++;

      // LOG DEBUG
//      printf("Added slice %d/%d\n", feature_index, IMAGE_WIDTH);

    }
  }

  if (feature_index >= IMAGE_WIDTH) {
    image_ready = true;
  }


  if (num_slices_generated > 0) {
    num_unfetched_slices += num_slices_generated;
  }
}

// ======================================
// === Trích ảnh dạng int8 [-128,127] ==
void image_audio_feature_generation_get_image(float* image_buffer, size_t buffer_size)
{
  if (buffer_size != IMAGE_WIDTH * IMAGE_HEIGHT) return;

//  const uint16_t FEATURE_FIXED_MIN = 0;
//  const uint16_t FEATURE_FIXED_MAX = 500;
//  uint16_t min = 65535, max = 0;
//  for (size_t i = 0; i < feature_index * IMAGE_HEIGHT; i++) {
//    if (feature_buffer[i] < min) min = feature_buffer[i];
//    if (feature_buffer[i] > max) max = feature_buffer[i];
//  }
//
//  // LOG DEBUG
//  printf("Spectrogram range: min=%d, max=%d\n", min, max);
//
//  int index = 0;
//  for (int y = 0; y < IMAGE_HEIGHT; y++) {
//      for (size_t x = 0; x < feature_index; x++) {
//        int32_t val = feature_buffer[x * IMAGE_HEIGHT + y];
//
//        // Quantize với range cố định
//        int32_t scaled = ((val - FEATURE_FIXED_MIN) * 255) / (FEATURE_FIXED_MAX - FEATURE_FIXED_MIN + 1);
//        scaled -= 128;
//
//        // Clamp lại nếu vượt giới hạn
//        if (scaled < -128) scaled = -128;
//        if (scaled > 127) scaled = 127;
//
//        image_buffer[index++] = (int8_t)scaled;
//      }
//
//      // Điền giá trị -128 (tương đương với "0") nếu thiếu cột
//      for (int x = feature_index; x < IMAGE_WIDTH; x++) {
//        image_buffer[index++] = -128;
//      }
//    }
//
//  // LOG DEBUG
////  printf("Running inference with feature_index = %d\n", feature_index);
//
//  num_unfetched_slices = 0;

    // Tìm max trong feature_buffer
  uint16_t max_val = 0;
  for (size_t i = 0; i < FEATURE_BUFFER_SIZE; i++) {
      const int capture_index = (feature_buffer_start + i) % FEATURE_BUFFER_SIZE;
      uint16_t val = feature_buffer[capture_index];
      if (val > max_val) {
        max_val = val;
      }
  }
  if (max_val == 0) {
      max_val = 1; // tránh chia 0
    }

    // In debug để xem range của spectrogram
    printf("Spectrogram range: min=0, max=%u\n", max_val);

    // Chuyển sang float32 [0,1] giống lúc huấn luyện
    size_t index = 0;
    float max_log = logf((float)max_val + 1.0f);
    for (size_t i = 0; i < FEATURE_BUFFER_SIZE; i++) {
      const int capture_index = (feature_buffer_start + i) % FEATURE_BUFFER_SIZE;
      float val = (float)feature_buffer[capture_index];

      // log-mel scaling (+1 để tránh log(0))
      val = logf(val + 1.0f);

      // chuẩn hóa về [0,1]
      image_buffer[index++] = val / max_log;
    }
}
// ======================================
// === Gán trực tiếp vào tensor =========
TfLiteStatus image_audio_feature_generation_fill_tensor(TfLiteTensor* input_tensor)
{
//  if (input_tensor->type != kTfLiteFloat32) {
//    return kTfLiteError;
//  }
//
//  //Ghi đè các byte trong input_tensor = 0
////  memset(input_tensor->data.int8, 0, input_tensor->bytes);
//
//  image_audio_feature_generation_get_image(input_tensor->data.f, input_tensor->bytes / sizeof(float));
//  return kTfLiteOk;
  if (input_tensor->type != kTfLiteFloat32) {
      return kTfLiteError;
    }

  float* dst = input_tensor->data.f;

    // Hằng số scale cố định tương thích Microfrontend (log_scale.shift=6)
    // Mẫu Silabs thường dùng khoảng 0..~666 cho spectrogram uint16
    const float FEATURE_SCALE_MAX = 666.0f;
    const float INV_SCALE = 1.0f / FEATURE_SCALE_MAX;

    // Tính min/max chỉ để debug (KHÔNG dùng để scale động nữa)
    uint16_t minval = 65535, maxval = 0;
    for (size_t i = 0; i < feature_index * IMAGE_HEIGHT; i++) {
      uint16_t v = feature_buffer[i];
      if (v < minval) minval = v;
      if (v > maxval) maxval = v;
    }
    if (maxval == 0) maxval = 1; // tránh chia 0 khi log

    printf("Spectrogram range: min=%u, max=%u\n", minval, maxval);

    // Ghi dữ liệu theo đúng thứ tự NHWC = (1, H=50, W=10, C=1)
    // Mảng feature_buffer hiện lưu theo lát thời gian (feature_index) mỗi lát 10 bins:
    //   offset = t * IMAGE_HEIGHT + y
    // TFLite (NHWC) flatten: index = (t * IMAGE_WIDTH + y) * 1
    size_t index = 0;
    for (int t = 0; t < IMAGE_WIDTH; t++) {
      if (t < (int)feature_index) {
        for (int y = 0; y < IMAGE_HEIGHT; y++) {
          uint16_t raw = feature_buffer[t * IMAGE_HEIGHT + y];

          // Scale TUYẾN TÍNH cố định về [0,1], KHÔNG log thêm lần 2
          float normalized = raw * INV_SCALE;
          if (normalized < 0.0f) normalized = 0.0f;
          if (normalized > 1.0f) normalized = 1.0f;

          // NHIỀU dataset spectrogram dùng ảnh NGƯỢC (nền sáng, năng lượng tối)
          // Hãy thử đảo màu để khớp training:
          float pixel = 1.0f - normalized;

          dst[index++] = pixel;
        }
      } else {
        // Cột chưa có dữ liệu: điền 1.0 (nền sáng sau khi đảo) hoặc 0.0 tùy bạn
        for (int y = 0; y < IMAGE_HEIGHT; y++) {
          dst[index++] = 1.0f;
        }
      }
    }

//    // LOG DEBUG
//    printf("First few input tensor values:\n");
//    for (int i = 0; i < 20 && i < (IMAGE_WIDTH * IMAGE_HEIGHT); ++i) {
//      printf("%.4f ", dst[i]);
//    }
//    printf("\n");

    return kTfLiteOk;
}

// ======================================
// === Trả số cột mới chưa dùng =========
int image_audio_feature_generation_get_unfetched_count()
{
  return num_unfetched_slices;
}

// ======================================
// === Reset toàn bộ ====================
void image_audio_feature_generation_reset()
{
  memset(audio_buffer, 0, sizeof(audio_buffer));
  memset(feature_buffer, 0, sizeof(feature_buffer));
  audio_write_index = 0;
  audio_read_index = 0;
  feature_index = 0;
  num_unfetched_slices = 0;

  FrontendReset(&frontend_state);
  image_ready = false;
}
// Cho phép chạy inference
bool image_audio_feature_generation_is_ready()
{
  return image_ready;
}
