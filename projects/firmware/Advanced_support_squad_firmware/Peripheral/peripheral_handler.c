#include "peripheral_handler.h"

#include "imu_bno055.h"
#include "PIR.h"
#include "loadcell.h"

IMU_data imu;
PIR_data pir;
Loadcell_data loadcell;

void init_peripheral(void)
{
  init_IMU();
  init_PIR();
  init_loadcell();
}

void read_peripheral(void)
{
  read_IMU(&imu);
  read_PIR(&pir);
  read_loadcell(&loadcell);
}
