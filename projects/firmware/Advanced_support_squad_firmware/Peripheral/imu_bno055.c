#include "imu_bno055.h"




/******************************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
//SET_MODE_FUNCTION
void SetModeNDOF(void) {
  uint8_t mode = BNO055_MODE_NDOF;
  // Set NDOF_Mode
  uint8_t reset = 0x20;
  I2C_LeaderWrite(0x28, 0x3F, &reset, 1);
  sl_udelay_wait(650000);
  I2C_LeaderWrite(BNO055_ADDRESS, BNO055_OPR_MODE_ADDR, &mode , 1);
  sl_udelay_wait(200000); // Delay

}
// INIT FUCTION
void init_IMU(void){
  sl_i2cspm_init_instances();
  SetModeNDOF();
}
/******************************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
// WRITE_READ FUCTION
void I2C_LeaderWrite(uint16_t followerAddress, uint8_t targetAddress,
                     uint8_t *txBuff, uint8_t numBytes)
{
  I2C_TransferSeq_TypeDef i2cTransfer;
  I2C_TransferReturn_TypeDef result;

  uint8_t buffer[numBytes + 1];
  buffer[0] = targetAddress;  // ghi địa chỉ thanh ghi đầu tiên
  for (int i = 0; i < numBytes; i++) {
    buffer[i + 1] = txBuff[i];  // dữ liệu
  }

  i2cTransfer.addr          = followerAddress << 1;  // Left shift
  i2cTransfer.flags         = I2C_FLAG_WRITE;
  i2cTransfer.buf[0].data   = buffer;
  i2cTransfer.buf[0].len    = numBytes + 1;
  i2cTransfer.buf[1].data   = NULL;
  i2cTransfer.buf[1].len    = 0;

  result = I2C_TransferInit(I2C0, &i2cTransfer);
  while (result == i2cTransferInProgress) {
    result = I2C_Transfer(I2C0);
  }

  if (result != i2cTransferDone) {
    printf("I2C Write error: %d\r\n", result);
  }
}
void I2C_LeaderRead(uint16_t followerAddress, uint8_t targetAddress,
                    uint8_t *rxBuff, uint8_t numBytes)
{
  // Transfer structure
  I2C_TransferSeq_TypeDef i2cTransfer;
  I2C_TransferReturn_TypeDef result;

  // Initialize I2C transfer
  i2cTransfer.addr          = followerAddress << 1;
  i2cTransfer.flags         = I2C_FLAG_WRITE_READ;
  i2cTransfer.buf[0].data   = &targetAddress;
  i2cTransfer.buf[0].len    = 1;
  i2cTransfer.buf[1].data   = rxBuff;
  i2cTransfer.buf[1].len    = numBytes;

  result = I2C_TransferInit(I2C0, &i2cTransfer);

  // Send data
  while (result == i2cTransferInProgress) {
    result = I2C_Transfer(I2C0);
  }
  if(result != i2cTransferDone) {
      printf("I2C Read error: %d\r\n", result);
  }
}
/******************************************************************************
*******************************************************************************
*******************************************************************************
*******************************************************************************/
//READ_RAW_DATA
void read_raw_data(Raw_data *raw_data){
  uint8_t accbuff[6],magbuff[6],gyrobuff[6],eulerbuff[6],quaternionbuff[8];
  I2C_LeaderRead(BNO055_ADDRESS,ACC_DATA_START,accbuff,6);
  I2C_LeaderRead(BNO055_ADDRESS,MAG_DATA_START,magbuff,6);
  I2C_LeaderRead(BNO055_ADDRESS,GYRO_DATA_START,gyrobuff,6);
  I2C_LeaderRead(BNO055_ADDRESS,EULER_DATA_START,eulerbuff,6);
  I2C_LeaderRead(BNO055_ADDRESS,QUATERNION_DATA_START,quaternionbuff,8);

  raw_data->acc_raw.x = (accbuff[1] << 8) | accbuff[0];
  raw_data->acc_raw.y = (accbuff[3] << 8) | accbuff[2];
  raw_data->acc_raw.z = (accbuff[5] << 8) | accbuff[4];

  raw_data->mag_raw.x = (magbuff[1] << 8) | magbuff[0];
  raw_data->mag_raw.y = (magbuff[3] << 8) | magbuff[2];
  raw_data->mag_raw.z = (magbuff[5] << 8) | magbuff[4];

  raw_data->gyro_raw.x = (gyrobuff[1] << 8) | gyrobuff[0];
  raw_data->gyro_raw.y = (gyrobuff[3] << 8) | gyrobuff[2];
  raw_data->gyro_raw.z = (gyrobuff[5] << 8) | gyrobuff[4];

  raw_data->euler_raw.x = (eulerbuff[1] << 8) | eulerbuff[0];
  raw_data->euler_raw.y = (eulerbuff[3] << 8) | eulerbuff[2];
  raw_data->euler_raw.z = (eulerbuff[5] << 8) | eulerbuff[4];

  raw_data->quaternion_raw.x = (quaternionbuff[1] << 8) | quaternionbuff[0];
  raw_data->quaternion_raw.y = (quaternionbuff[3] << 8) | quaternionbuff[2];
  raw_data->quaternion_raw.z = (quaternionbuff[5] << 8) | quaternionbuff[4];
  raw_data->quaternion_raw.z = (quaternionbuff[7] << 8) | quaternionbuff[6];
}
void convert_raw_to_real_local(Raw_data raw_data,
                              Real_local_data *real_local_data){
  // Convert Accelerometer data mg->m/s^2
  // LSB/mg (milli-g)
  // Range ±2g: 1m/s^2 = 100 LSB
  real_local_data->acc_local_real.x = raw_data.acc_raw.x / 100.0;
  real_local_data->acc_local_real.y = raw_data.acc_raw.y / 100.0;
  real_local_data->acc_local_real.z = raw_data.acc_raw.z / 100.0;
  // Convert Gyroscope data
  // LSB/dps (degrees per second)
  // Range ±2000°/s: 1°/s = 16 LSB
  real_local_data->gyro_local_real.x = raw_data.gyro_raw.x /16.0;
  real_local_data->gyro_local_real.y = raw_data.gyro_raw.y /16.0;
  real_local_data->gyro_local_real.z = raw_data.gyro_raw.z /16.0;

  // Convert Magnetometer data
  // LSB/µT (microTesla)
  // Range ±1300µT: 1µT = 16 LSB
  real_local_data->mag_local_real.x = raw_data.mag_raw.x / 16.0;
  real_local_data->mag_local_real.y = raw_data.mag_raw.y / 16.0;
  real_local_data->mag_local_real.z = raw_data.mag_raw.z / 16.0;

  // Convert Euler Angles data
  // LSB/degree
  // Range: Heading/Yaw(z): 0° to 360°(Rotation around Z-axis, points to North)
  //        Roll(x): -90° to +90°(Rotation around X-axis, positive = tilt right)
  //        Pitch(y): -180° to +180°(Rotation around Y-axis, positive = tilt up)
  // Earth Frame Reference:
  //        X-axis: Points to East
  //        Y-axis: Points to North
  //        Z-axis: Points Up (opposite to gravity)
  // 1° = 16 LSB
  real_local_data->euler_real.x = raw_data.euler_raw.x / 16.0;
  real_local_data->euler_real.y = raw_data.euler_raw.y / 16.0;
  real_local_data->euler_real.z = raw_data.euler_raw.z / 16.0;

  // Convert Quaternion data
  // LSB/quaternion unit
  // Range: 1 quaternion unit = 2^14 LSB = 16384 LSB
  real_local_data->quaternion_real.w = raw_data.quaternion_raw.w / 16384.0;
  real_local_data->quaternion_real.x = raw_data.quaternion_raw.x / 16384.0;
  real_local_data->quaternion_real.y = raw_data.quaternion_raw.y / 16384.0;
  real_local_data->quaternion_real.z = raw_data.quaternion_raw.z / 16384.0;
}
/******************************************************************************
*******************************************************************************/
/**
 * @brief Calculate the inverse of a quaternion
 * @param quar Input quaternion to be inverted
 * @return Inverted quaternion
 *
 * This function calculates the inverse of a quaternion by dividing each component by the quaternion's norm and
 * negating the vector components (x, y, z).
 * For a unit quaternion, this is equivalent to its conjugate.
 * Formula: q^(-1) = conjugate(q)/norm(q), where norm = w^2 + x^2 + y^2 + z^2
 */

Real_quaternion quaternion_inverse(Real_quaternion qua) {
    Real_quaternion result;
    float norm = qua.w * qua.w + qua.x * qua.x + qua.y * qua.y + qua.z * qua.z;
    result.w = qua.w / norm;
    result.x = -qua.x / norm;
    result.y = -qua.y / norm;
    result.z = -qua.z / norm;
    return result;
}



/*#############################################################################################################*/
/**
 * @brief Multiply two quaternions together
 * @param qua_1 First quaternion operand
 * @param qua_2 Second quaternion operand
 * @return Result of quaternion multiplication
 *
 * This function performs quaternion multiplication using the Hamilton product rule.
 * For two quaternions q1 = (w1,x1,y1,z1) and q2 = (w2,x2,y2,z2), their product is:
 * w = w1*w2 - x1*x2 - y1*y2 - z1*z2
 * x = w1*x2 + x1*w2 + y1*z2 - z1*y2
 * y = w1*y2 - x1*z2 + y1*w2 + z1*x2
 * z = w1*z2 + x1*y2 - y1*x2 + z1*w2
 */
/*############################################################################*/

Real_quaternion quarternion_multiply(Real_quaternion qua_1, Real_quaternion qua_2) {
    Real_quaternion result;
    result.w = qua_1.w * qua_2.w - qua_1.x * qua_2.x - qua_1.y * qua_2.y - qua_1.z * qua_2.z;
    result.x = qua_1.w * qua_2.x + qua_1.x * qua_2.w + qua_1.y * qua_2.z - qua_1.z * qua_2.y;
    result.y = qua_1.w * qua_2.y - qua_1.x * qua_2.z + qua_1.y * qua_2.w + qua_1.z * qua_2.x;
    result.z = qua_1.w * qua_2.z + qua_1.x * qua_2.y - qua_1.y * qua_2.x + qua_1.z * qua_2.w;
    return result;
}



/*############################################################################*/
/**
 * @brief Rotate a vector by a quaternion
 * @param vec Input vector to be rotated
 * @param quar Quaternion representing the rotation
 * @return Rotated vector
 *
 * This function rotates a 3D vector by a quaternion using the formula:
 * v' = q * v_quat * q^-1
 * where v' is the rotated vector, q is the rotation quaternion, and v_quat is the input vector converted to a
 * quaternion.
 * The quaternion inverse is calculated to reverse the rotation after the multiplication.
 * The result is then converted back to a 3D vector, but converted to global coordinates.
 */
/*############################################################################*/
Real_vector3 rotate_vector_by_quarternion(Real_vector3 vec, Real_quaternion qua) {
    Real_quaternion v_qua = {0, vec.x, vec.y, vec.z}; // Convert vector to quaternion
    Real_quaternion q_inv = quaternion_inverse(qua); // Calculate inverse of quaternion

    // Perform rotation: v' = q * v_quat * q^-1
    Real_quaternion v_rotated = quarternion_multiply(quarternion_multiply(qua, v_qua), q_inv);

    // Convert result back to vector
    Real_vector3 result;
    result.x = v_rotated.x;
    result.y = v_rotated.y;
    result.z = v_rotated.z;

    return result;
}
/*############################################################################*/
/**
 * @brief Convert IMU data from local (sensor) coordinates to global (Earth) coordinates
 * @param imu_local_data Input IMU data in local coordinate system
 * @param imu_global_data Pointer to structure where global coordinate data will be stored
 *
 * This function converts IMU sensor readings from the local coordinate frame (sensor's perspective)
 * to the global coordinate frame (Earth's reference) using quaternion rotation:
 *
 * Local (Sensor) Frame:
 * - Represents measurements relative to how sensor is oriented
 * - Changes with sensor movement/orientation
 * - X,Y,Z axes aligned with sensor's physical orientation
 *
 * Global (Earth) Frame:
 * - X-axis: Points East
 * - Y-axis: Points North
 * - Z-axis: Points Up (opposite to gravity)
 * - Fixed reference frame regardless of sensor orientation
 *
 * Conversion is necessary to:
 * - Get consistent measurements regardless of sensor orientation
 * - Reference measurements to Earth's coordinate system
 * - Enable proper navigation and orientation tracking
 *
 * Uses quaternion rotation: v_global = q * v_local * q^(-1)
 * where q is the orientation quaternion from BNO055
 *
 * Euler angles are copied directly as they are already in global frame
 * Quaternion data is not use anymore
 */
/*############################################################################*/
void convert_local_to_global(Real_local_data real_local_data, IMU_data *real_global_data) {
    // Convert Accelerometer data to global frame
    real_global_data->acc = rotate_vector_by_quarternion(real_local_data.acc_local_real,
                                                         real_local_data.quaternion_real);

    // Convert Gyroscope data to global frame
    real_global_data->gyro = rotate_vector_by_quarternion(real_local_data.gyro_local_real,
                                                          real_local_data.quaternion_real);

    // Convert Magnetometer data to global frame
    real_global_data->mag = rotate_vector_by_quarternion(real_local_data.mag_local_real,
                                                         real_local_data.quaternion_real);

    // Copy Euler angles data directly
    real_global_data->euler = real_local_data.euler_real;
}
/*##############################################################################
 * ###############################*/
/**
 * @brief Read IMU sensor data and convert to global coordinates
 * @param imu_data Pointer to structure where global IMU data will be stored
 *
 * This function reads raw sensor data from BNO055, converts it to real-world units, then converts it from
 * local (sensor) coordinates to global (Earth) coordinates.
 * The final IMU data is stored in the provided structure.
 */

void read_IMU(IMU_data *imu_data){
    Raw_data raw_data;
    Real_local_data real_local_data;
    read_raw_data(&raw_data);
    convert_raw_to_real_local(raw_data, &real_local_data);
    convert_local_to_global(real_local_data, imu_data);
}
