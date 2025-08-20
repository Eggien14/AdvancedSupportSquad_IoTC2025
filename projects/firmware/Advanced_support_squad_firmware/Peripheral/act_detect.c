#include "act_detect.h"
#include "peripheral_handler.h"
#include "math.h"

int detect_code;
Loadcell_data last_load = 0;

void act_detect(void)
{
  if(fabs(loadcell - last_load)>LOAD_THRESHOLD){
      if(loadcell - last_load > 0){
          if(pir == PIR_ON)
            detect_code = ADD;
          else
            detect_code = THROW;
      }else{
          if(imu.euler.x > TILT_THRESHOLD || imu.euler.y > TILT_THRESHOLD)
            detect_code = FALL;
          else if(pir == PIR_ON)
            detect_code = REMOVE;
          else
            detect_code = DROP;
      }
      last_load = loadcell;
  }else{
      if(imu.euler.x > TILT_THRESHOLD || imu.euler.y > TILT_THRESHOLD){
          detect_code = TILT;
      }
      else if(imu.acc.x > ACC_THRESHOLD || imu.acc.y > ACC_THRESHOLD ||
          imu.acc.z > ACC_THRESHOLD){
          detect_code = PUSH_HARD;
      }
  }
  detect_code = NO_ACT;
}
