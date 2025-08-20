#ifndef TARGET_TRACKING_RSSI_FILTER_H_
#define TARGET_TRACKING_RSSI_FILTER_H_


/******************************************************************************************//**
 *
 *********************************************************************************************/

#include <stdint.h>



#include "target_tracking_handler.h"



/******************************************************************************************//**
 *
 * Kalman filter variable and data structure define
 *
*********************************************************************************************/

// Tham số Kalman filter cho từng beacon
static const KalmanState_t KF_DEFAULT_PARAMS[NUM_ANCHORS] = {
    { .x_est = -50.0, .p_est = 1.0, .Q = 1e-6, .R = 0.04, .TBC = 3 },
    { .x_est = -50.0, .p_est = 1.0, .Q = 1e-6, .R = 0.04, .TBC = 3 },
    { .x_est = -50.0, .p_est = 1.0, .Q = 1e-6, .R = 0.04, .TBC = 3 },
    { .x_est = -50.0, .p_est = 1.0, .Q = 1e-6, .R = 0.04, .TBC = 3 }
};



/******************************************************************************************//**
 *
 * Kalman_filter function define
 *
 *********************************************************************************************/

/**
 * @brief Cập nhật bộ lọc Kalman cho một giá trị RSSI mới.
 * @param state  con trỏ đến state hiện tại của bộ lọc Kalman
 * @param meas   giá trị RSSI đo được (dBm)
 * @return giá trị RSSI đã lọc
 */
double kalman_filter(KalmanState_t *state, double meas);


/**
 * @brief Đọc và cập nhật dữ liệu RSSI từ biến global, thực hiện lọc Kalman.
 */
void filter_rssi_data(void);



#endif /* TARGET_TRACKING_RSSI_FILTER_H_ */
