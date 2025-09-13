#ifndef TARGET_TRACKING_PATH_LOSS_H_
#define TARGET_TRACKING_PATH_LOSS_H_



/******************************************************************************************//**
 *
 *********************************************************************************************/

#include "config.h"
#include "target_tracking_handler.h"




/******************************************************************************************//**
 *
 * Pathloss and Radius adjust variable and data structure define
 *
*********************************************************************************************/

// Tham số path loss mặc định cho mỗi beacon
static const PathLoss_t PL_DEFAULT_PARAMS[NUM_ANCHORS] = {
    { .A = -34.0, .m = 2.3 },  // Beacon 0
    { .A = -35.0, .m = 2.1 },  // Beacon 1
    { .A = -38.0, .m = 1.8 },  // Beacon 2
    { .A = -40.0, .m = 1.7 }   // Beacon 3
};

// Tham số Epsilon hiệu chỉnh bán kính
#define EPSILON 0.01



/******************************************************************************************//**
 *
 * Kalman_filter function define
 *
 *********************************************************************************************/

/**
 * @brief Hàm tính khoảng cách từ RSSI
 * @param rssi Giá trị RSSI đo được.
 * @param A Hệ số tham chiếu RSSI tại d0 (dBm).
 * @param m Hệ số path loss.
 * @return Khoảng cách tính được từ RSSI.
 */
double rssi_to_dist(double rssi, double A, double m);


void adjust_three_dist(double D01, double D02, double D12,double *r0, double *r1, double *r2);


void adjust_last_dist(double D01, double D02, double D12,double *r0, double *r1, double *r2);


#endif /* TARGET_TRACKING_PATH_LOSS_H_ */
