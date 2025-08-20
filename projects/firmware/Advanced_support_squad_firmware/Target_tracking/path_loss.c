#include <math.h>
#include <stdbool.h>



#include "path_loss.h"



/**
 * @brief Hàm tính khoảng cách từ RSSI sử dụng công thức đơn giản.
 *        d = 10^((A - rssi) / (10 * m))
 * @param rssi Giá trị RSSI đo được.
 * @param A Hệ số tham chiếu RSSI tại d0 (dBm).
 * @param m Hệ số path loss.
 * @return Khoảng cách tính được từ RSSI.
 */
double rssi_to_dist(double rssi, double A, double m) {
    return pow(10.0, (A - rssi) / (10.0 * m));
}



void adjust_three_dist(
    double D01, double D02, double D12,
    double *r0, double *r1, double *r2
) {
    double a01 = D01/(*r0 + *r1);
    double a02 = D02/(*r0 + *r2);
    double a12 = D12/(*r1 + *r2);
    double alpha = fmax(a01, fmax(a02, a12)) + EPSILON;
    *r0 = *r0 * alpha;  *r1 = *r1 * alpha;  *r2 = *r2 * alpha;
}


void adjust_last_dist(
    double D01, double D02, double D12,
    double *r0, double *r1, double *r2
) {
    double beacon_rad[3] = {*r0, *r1, *r2};
    double biggest_rad = beacon_rad[0];
    int biggest_rad_beacon = 0;
    for(int i=1; i<3; i++){
        if (biggest_rad < beacon_rad[i]){
            biggest_rad = beacon_rad[i];
            biggest_rad_beacon = i;
        }
    }
    switch(biggest_rad_beacon){
      case 0:
        if (biggest_rad > D01 + *r1 ){
            *r0 = D01 + *r1 - EPSILON;
        }
        if (biggest_rad > D02 + *r2){
            *r0 = D02 + *r2 - EPSILON;
        }
        break;
      case 1:
        if (biggest_rad > D01 + *r0 ){
            *r1 = D01 + *r0 - EPSILON;
        }
        if (biggest_rad > D12 + *r2){
            *r1 = D12 + *r2 - EPSILON;
        }
        break;
      case 2:
        if (biggest_rad > D12 + *r1 ){
            *r2 = D12 + *r1 - EPSILON;
        }
        if (biggest_rad > D02 + *r0){
            *r1 = D02 + *r0 - EPSILON;
        }
    }
}
















