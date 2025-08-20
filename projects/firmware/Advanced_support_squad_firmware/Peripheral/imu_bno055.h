#ifndef IMU_BNO055_H
#define IMU_BNO055_H

#include "peripheral_handler.h"
#include "sl_i2cspm_instances.h"
#include "sl_udelay.h"
#include <stdio.h>

#define BNO055_ADDRESS 0x28           // Default I2C address for BNO055

// BNO055 Register Addresses
#define ACC_DATA_START 0x08            // Accelerometer data registers 0x08-0x0D
#define MAG_DATA_START 0x0E            // Magnetometer data registers
#define GYRO_DATA_START 0x14           // Gyroscope data registers
#define EULER_DATA_START 0x1A          // Euler angles data registers
#define QUATERNION_DATA_START 0x20     // Quaternion data registers

// BNO055 Operation Mode Registers
#define BNO055_OPR_MODE_ADDR 0x3D      // Operation mode register address
#define BNO055_MODE_CONFIG 0x00        // Configuration mode
#define BNO055_MODE_NDOF 0x0C          // Nine Degrees of Freedom fusion mode


/******************************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
//INIT FUNCTION
void init_IMU(void);
//WRITE_READ FUCTION
void I2C_LeaderWrite(uint16_t followerAddress, uint8_t targetAddress,
                     uint8_t *txBuff, uint8_t numBytes);
void I2C_LeaderRead(uint16_t followerAddress, uint8_t targetAddress,
                    uint8_t *rxBuff, uint8_t numBytes);
//READ_RAW_DATA_FUCTION
void read_raw_data(Raw_data *raw_data);
void convert_raw_to_real_local(Raw_data raw_data,
                              Real_local_data *real_local_data);
Real_quaternion quaternion_inverse(Real_quaternion qua);
Real_quaternion quarternion_multiply(Real_quaternion qua_1, Real_quaternion qua_2);
Real_vector3 rotate_vector_by_quarternion(Real_vector3 vec, Real_quaternion qua);
void convert_local_to_global(Real_local_data real_local_data,
                             IMU_data *real_global_data);
void read_IMU(IMU_data *imu_data);
#endif // IMU_BNO055_H
