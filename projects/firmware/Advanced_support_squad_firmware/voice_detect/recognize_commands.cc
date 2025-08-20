/*
 * recognize_commands.cc
 *
 *  Created on: Aug 2, 2025
 *      Author: Dell
 */
#include "recognize_commands.h"

#include <limits>

// Labels used by tflite model
const char* kCategoryLabels[kMaxCategoryCount] = {
    "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go", "unknown", "_background_noise_"
};

RecognizeCommands::RecognizeCommands(tflite::ErrorReporter* error_reporter,
                                     uint8_t detection_threshold,
                                     int32_t suppression_ms)
  : error_reporter_(error_reporter),
  detection_threshold_(detection_threshold),
  suppression_ms_(suppression_ms),
  previous_results_(error_reporter)
{
  previous_top_label_index_ = 11; // "background"
  previous_top_label_time_ = std::numeric_limits < int32_t > ::min();
}

TfLiteStatus RecognizeCommands::ProcessLatestResults(
  const TfLiteTensor* latest_results, const int32_t current_time_ms,
  uint8_t* found_command_index, uint8_t* score, bool* is_new_command)
{

uint8_t category_count = latest_results->dims->data[1];
int8_t current_top_index = 0;
int32_t current_top_score = 0;
uint8_t converted_scores[kMaxCategoryCount];

// Convert the model output to uint8
if (latest_results->type == kTfLiteInt8) {
    for(int i = 0; i < category_count; ++i) {
      converted_scores[i] = (uint8_t)(latest_results->data.int8[i] + 128);
    }
  } else if (latest_results->type == kTfLiteFloat32) {
      for (int i = 0; i < category_count; ++i) {
        float val = latest_results->data.f[i];
        // Nếu output trong khoảng [0, 1]
        if (val < 0.0f) val = 0.0f;
        if (val > 1.0f) val = 1.0f;
        converted_scores[i] = (uint8_t)(val * 255.0f);
      }
    } else {
      TF_LITE_REPORT_ERROR(error_reporter_, "Unsupported output tensor data type, must be int8 or float32");
      return kTfLiteError;
  }

  for (int i = 0; i < category_count; i++) {
    if (converted_scores[i] > current_top_score) {
      current_top_score = converted_scores[i];
      current_top_index = i;
    }
  }

  // If we've recently had another label trigger, assume one that occurs too
  // soon afterwards is a bad result.
  int64_t time_since_last_top;
  if ((previous_top_label_index_ == 11 || previous_top_label_index_ == 10)
      || (previous_top_label_time_ == std::numeric_limits < int32_t > ::min())) {
    time_since_last_top = std::numeric_limits < int32_t > ::max();
    // Reset timer if detecting background / unknown
  } else {
    time_since_last_top = current_time_ms - previous_top_label_time_;
  }

  if ((current_top_score > detection_threshold_) && (time_since_last_top > suppression_ms_)) {
    previous_top_label_index_ = current_top_index;
    previous_top_label_time_ = current_time_ms;
    *is_new_command = true;
  } else {
    *is_new_command = false;
  }

  *found_command_index = current_top_index;
  *score = current_top_score;
  return kTfLiteOk;
}




