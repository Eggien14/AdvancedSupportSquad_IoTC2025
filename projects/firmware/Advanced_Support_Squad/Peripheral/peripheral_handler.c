#include "peripheral_handler.h"

#include "imu_bno055.h"
#include "PIR.h"
#include "em_gpio.h"
#include "millis.h"
#include "stdbool.h"

IMU_data imu;
PIR_data pir;
Loadcell_data loadcell;
CAM_state cam_state = false;
bool ledact_state = false;

uint32_t CamOnTime = 0;
uint32_t LedActOnTime = 0;

void init_peripheral(void)
{
  init_IMU();
  init_PIR();
  init_millis();
  GPIO_PinModeSet(gpioPortB,8,gpioModeDisabled,0);
  GPIO_PinModeSet(gpioPortD,8,gpioModeDisabled,0);
}

void read_peripheral(void)
{
  read_IMU(&imu);
  read_PIR(&pir);
  if (pir == 1 && !cam_state) {
    GPIO_PinOutSet(gpioPortB ,8);
    CamOnTime = millis();
    cam_state = true;
  }

  if (cam_state && (millis() - CamOnTime >= 5000)) {
    GPIO_PinOutClear(gpioPortB ,8);
    cam_state = false;
  }
  act_detect();
  if(detect_code != 0 && !ledact_state){
      GPIO_PinOutSet(gpioPortD ,8);
      LedActOnTime = millis();
      ledact_state = true;
  }
  if(detect_code == 0 && (millis() - LedActOnTime >= 1500)){
      GPIO_PinOutClear(gpioPortD ,8);
      ledact_state = false;

  }
}
