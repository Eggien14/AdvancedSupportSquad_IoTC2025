/*
 * image_audio_feature_generation_init.c
 *
 *  Created on: Aug 3, 2025
 *      Author: Dell
 */


#include "sl_mic.h"
#include "image_audio_feature_generation.h"

#define MIC_DMA_SIZE 512

static int16_t mic_sample_buffer[2 * MIC_DMA_SIZE];

/***************************************************************************//**
 *  Retrieves the features as type uint16 and copies them to the provided buffer.
 ******************************************************************************/
static void mic_buffer_ready_callback(const int16_t *buffer, uint32_t n_frames)
{
  image_audio_feature_generation_write_audio_chunk(buffer, n_frames);
}

/***************************************************************************//**
 *  Retrieves the features as type uint16 and copies them to the provided buffer.
 ******************************************************************************/
sl_status_t image_audio_feature_generation_init()
{
  // Initialize microphone as a 1-channel streaming microphone
  sl_status_t mic_status;

  mic_status = sl_mic_init(16000, 1);
  if (mic_status != SL_STATUS_OK) {
    return mic_status;
  }

  mic_status = sl_mic_start_streaming(mic_sample_buffer, MIC_DMA_SIZE, (sl_mic_buffer_ready_callback_t)mic_buffer_ready_callback);

  if (mic_status != SL_STATUS_OK) {
    return mic_status;
  }

  image_audio_feature_generation_frontend_init();

  return SL_STATUS_OK;
}




