#include "act_detect.h"
#include "peripheral_handler.h"
#include "math.h"

int detect_code;
Loadcell_data last_load = 0;

void act_detect(void)
{
  if(imu.euler.y < -10 || imu.euler.y > 10  ||
      imu.euler.z < -10 || imu.euler.z > 10){
      detect_code = TILT;
  }
  else if(imu.acc.x > 30 || imu.acc.x < -30
      || imu.acc.y > 25 || imu.acc.y < -25
      || imu.acc.z < -30|| imu.acc.z > 30){
      detect_code = PUSH_HARD;
  }
  else{
      detect_code = NO_ACT;
  }
}
