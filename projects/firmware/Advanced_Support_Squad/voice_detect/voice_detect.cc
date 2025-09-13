/*
 * voice_detect.cc
 *
 *  Created on: Jul 29, 2025
 *      Author: Dell
 */
#include "os.h"
#include "sl_power_manager.h"
#include "sl_status.h"
#include "voice_detect.h"
#include "recognize_commands.h"
#include "recognize_commands_config.h"
#include "sl_tflite_micro_model.h"
#include "sl_tflite_micro_init.h"
#include "sl_ml_audio_feature_generation.h"
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "sl_sleeptimer.h"
#include "Mylib/voice_push_to_talk.h"



/*******************************************************************************
 *******************************   DEFINES   ***********************************
 ******************************************************************************/
#ifndef INFERENCE_INTERVAL_MS
#define INFERENCE_INTERVAL_MS 200
#endif

#ifndef TASK_STACK_SIZE
#define TASK_STACK_SIZE       512
#endif

#ifndef TASK_PRIORITY
#define TASK_PRIORITY         20
#endif

/*******************************************************************************
 ***************************  LOCAL VARIABLES   ********************************
 ******************************************************************************/

// Pointer to RecognizeCommands object for handling recognitions.
static RecognizeCommands *command_recognizer = nullptr;

// Micrium task control block
static OS_TCB tcb;

// Micrium task stack
static CPU_STK stack[TASK_STACK_SIZE];

static volatile char cmd_latest[16] = "unknown";
/*******************************************************************************
 **************************   LOCAL FUNCTIONS    *******************************
 ******************************************************************************/

// Application task
static void voice_detect_task(void *arg);

/***************************************************************************//**
 * Run model inference
 *
 * Copies the currently available data from the feature_buffer into the input
 * tensor and runs inference, updating the global output_tensor.
 ******************************************************************************/
static sl_status_t run_inference()
{
  // Update model input tensor
  sl_status_t status = sl_ml_audio_feature_generation_fill_tensor(sl_tflite_micro_get_input_tensor());
  if (status != SL_STATUS_OK){
    return SL_STATUS_FAIL;
  }

  // Run the model on the spectrogram input and make sure it succeeds.
  TfLiteStatus invoke_status = sl_tflite_micro_get_interpreter()->Invoke();
  if (invoke_status != kTfLiteOk) {
    return SL_STATUS_FAIL;
  }

  return SL_STATUS_OK;
}

/***************************************************************************//**
 * Processes the output from a model inference
 ******************************************************************************/
static sl_status_t process_output(){
  // Determine whether a command was recognized based on the output of inference
  uint8_t found_command_index = 0;
  uint8_t score = 0;
  bool is_new_command = false;
  uint32_t current_time_stamp;

  // Get current time stamp needed by CommandRecognizer
  current_time_stamp = sl_sleeptimer_tick_to_ms(sl_sleeptimer_get_tick_count());

  // Perform post processing and filtering of the model output to get a labeled output with a score value.
  TfLiteStatus process_status = command_recognizer->ProcessLatestResults(
      sl_tflite_micro_get_output_tensor(), current_time_stamp, &found_command_index, &score, &is_new_command);

  if (process_status != kTfLiteOk) {
    return SL_STATUS_FAIL;
  }

  if (is_new_command) {
      const char* keyword = kCategoryLabels[found_command_index];
      if (strcmp(keyword, "background") == 0) {
          keyword = "unknown";
      }
      size_t i = 0;
      for (; keyword[i] != '\0' && i < sizeof(cmd_latest) - 1; i++) {
          cmd_latest[i] = keyword[i];
      }
      cmd_latest[i] = '\0';

      // Print heard command
      if (found_command_index == 0){
      // "help"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 1){
      // "checkout"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 2){
      // "baby"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 3){
      // "exit"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 4){
      // "food"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 5){
      // "locker"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      } else if (found_command_index == 6){
      // "restroom"
          printf("Heard %s (%d) @%ldms\r\n", kCategoryLabels[found_command_index],
                       score, current_time_stamp);
      }
  }
  return SL_STATUS_OK;
}

/*******************************************************************************
 **************************   GLOBAL FUNCTIONS   *******************************
 ******************************************************************************/

/***************************************************************************//**
 * Initialize application.
 ******************************************************************************/
void voice_detect_init(void)
{
  RTOS_ERR err;

    // Create Application Task
    char task_name[] = "voice detect task";
    OSTaskCreate(&tcb,
                 task_name,
                 voice_detect_task,
                 DEF_NULL,
                 TASK_PRIORITY,
                 &stack[0],
                 (TASK_STACK_SIZE / 10u),
                 TASK_STACK_SIZE,
                 0u,
                 0u,
                 DEF_NULL,
                 (OS_OPT_TASK_STK_CLR),
                 &err);

    EFM_ASSERT((RTOS_ERR_CODE_GET(err) == RTOS_ERR_NONE));
}

/***************************************************************************//**
 * Voice detect task
 ******************************************************************************/
void voice_detect_task(void *arg)
{
  RTOS_ERR err;
  (void)&arg;

  printf("Voice Detect\r\n");
  printf("  threshold=%d\r\n", DETECTION_THRESHOLD);
  printf("  suppression time=%d ms\r\n", SUPPRESSION_TIME_MS);
  printf("Listening for keywords...\r\n");
  sl_ml_audio_feature_generation_init();

  // Instantiate CommandRecognizer
  static RecognizeCommands static_recognizer(sl_tflite_micro_get_error_reporter(),
                                                 DETECTION_THRESHOLD,
                                                 SUPPRESSION_TIME_MS);
  command_recognizer = &static_recognizer;

  // Add EM1 requirement to allow microphone sampling
  sl_power_manager_add_em_requirement(SL_POWER_MANAGER_EM1);

//  bool mic_started = false;

  while (1) {
      // Wait INFERENCE_INTERVAL_MS ms
      OSTimeDlyHMSM(0, 0, 0, INFERENCE_INTERVAL_MS, OS_OPT_TIME_PERIODIC, &err);
      EFM_ASSERT((RTOS_ERR_CODE_GET(err) == RTOS_ERR_NONE));

      // Perform a word detection
      sl_ml_audio_feature_generation_update_features();

      if (!voice_push_to_talk_get()) {
        continue;
      }

      // Chạy inference
      if (run_inference() == SL_STATUS_OK) {
              process_output();
      }
  }
}

void get_voice_cmd(char* command, size_t command_size)
{
  if (!command || command_size == 0) return;
  size_t i = 0;
  for (; cmd_latest[i] != '\0' && i < command_size - 1; ++i) {
      command[i] = cmd_latest[i];
  }
  command[i] = '\0';
}
