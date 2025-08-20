#ifndef PERIPHERAL_HANDLER_H
#define PERIPHERAL_HANDLER_H

#include "stdint.h"
#include "stdbool.h"


/*PIR_DATA******************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
typedef double Loadcell_data;
/*PIR_DATA******************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
typedef bool PIR_data;
/*BNO055_DATA******************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
//Quarternion struct
typedef struct
{
    int16_t w, x, y, z;
}Raw_quaternion;

typedef struct
{
    float w, x, y, z;
}Real_quaternion;
//Vector3 struct
typedef struct
{
    int16_t x, y, z;
}Raw_vector3;
typedef struct
{
    float x, y, z;
}Real_vector3;

//IMU raw data defines
typedef struct
{
    Raw_vector3 acc_raw;
    Raw_vector3 mag_raw;
    Raw_vector3 gyro_raw;
    Raw_vector3 euler_raw;
    Raw_quaternion quaternion_raw;
}Raw_data;
typedef struct
{
    Real_vector3 acc_local_real;
    Real_vector3 mag_local_real;
    Real_vector3 gyro_local_real;
    Real_vector3 euler_real;
    Real_quaternion quaternion_real;
}Real_local_data;

//IMU real global data defines
typedef struct
{
    Real_vector3 gyro;
    Real_vector3 mag;
    Real_vector3 acc;
    Real_vector3 euler;
}IMU_data;

extern IMU_data imu;
extern PIR_data pir;
extern Loadcell_data loadcell;

void init_peripheral(void);
void read_peripheral(void);

#endif // PERIPHERAL_HANDLER_H
