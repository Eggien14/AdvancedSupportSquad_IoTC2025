#include <stddef.h>
#include <math.h>



#include "rssi_filter.h"



/**
 * @brief Cập nhật trạng thái Kalman filter cho một giá trị RSSI mới.
 *        Bộ lọc Kalman sẽ tính toán giá trị ước lượng RSSI sau khi đo.
 * @param state  con trỏ đến trạng thái Kalman filter của beacon
 * @param meas   giá trị RSSI đo được (dBm)
 * @return giá trị x_est đã được cập nhật (RSSI đã lọc)
 */
double kalman_filter(KalmanState_t *state, double meas) {
    // Dự đoán
    state->x_est = state->x_est;  // Giữ lại giá trị ước lượng trước
    state->p_est = state->p_est + state->Q;  // Tính sai số ước lượng

    // Cập nhật giá trị dựa trên measurement mới
    double K = state->p_est / (state->p_est + state->R);  // Tính Kalman gain
    state->x_est = state->x_est + K * (meas - state->x_est);  // Cập nhật ước lượng
    state->p_est = (1 - K) * state->p_est;  // Cập nhật sai số ước lượng

    return state->x_est;  // Trả về giá trị RSSI đã được lọc
}


double tbc_rssi[NUM_ANCHORS] = {0};
/**
 * @brief Đọc và cập nhật dữ liệu RSSI từ beacon, thực hiện lọc Kalman.
 */
void filter_rssi_data(void) {
    for (int i = 0; i < NUM_ANCHORS; i++) {
        // TBC filter
        tbc_rssi[i] = anchor_filters[i].raw_rssi[9];
//        tbc_rssi[i] = 0 ;
//        for (int j = 0; j < anchors[i].kf.TBC; j++){
//            tbc_rssi[i] += anchor_filters[i].raw_rssi[9-j];
//        }
//        tbc_rssi[i] = tbc_rssi[i] / anchors[i].kf.TBC;

        // Cập nhật giá trị filtered_rssi bằng bộ lọc Kalman
        anchor_filters[i].filtered_rssi = kalman_filter(&anchors[i].kf, tbc_rssi[i]);
    }
}
