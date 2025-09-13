#include <string.h>
#include <stdio.h>

// Include header files for target tracking functionality
#include "target_tracking_handler.h"
#include "rssi_filter.h"
#include "path_loss.h"
#include "trilateration.h"



/******************************************************************************************//**
 *
 * Global variable define
 *
 *********************************************************************************************/

AnchorConfig_t                anchors[NUM_ANCHORS];             // Configuration data for each anchor/beacon
AnchorFilter_t                anchor_filters[NUM_ANCHORS];      // RSSI filtering data for each anchor
AnchorPathloss_t              anchor_pathloss[NUM_ANCHORS];     // Path loss calculation data for each anchor




/******************************************************************************************//**
 *
 * Target Tracking Function Definitions
 * These functions implement the core target tracking algorithms
 *
 *********************************************************************************************/

/**
 * @brief Updates the raw RSSI buffer for a specific beacon with the latest value.
 *        This buffer contains the 10 most recent RSSI values, with the newest value
 *        at the end of the array and the oldest value at the beginning.
 * @param beacon_idx Index of the beacon to update (0-3)
 * @param new_rssi Latest RSSI value to add to the buffer
 */
void update_rssi_buffer(int beacon_idx, int8_t new_rssi) {
    // Get the raw_rssi array for the corresponding beacon
    AnchorFilter_t *filter = &anchor_filters[beacon_idx];

    // Shift old values one position to the left (removes oldest value)
    for (int i = 0; i < 9; i++) {
        filter->raw_rssi[i] = filter->raw_rssi[i + 1];
    }

    // Add the newest RSSI value to the end of the array
    filter->raw_rssi[9] = new_rssi;
}


/**
 * @brief Initializes the target tracking system with default parameters.
 *        Sets up Kalman filter coefficients and path loss parameters for all anchors,
 *        then calculates the distances between beacons.
 */
void target_tracking_setup(void) {
  anchors[0].x = BEACON0_X; anchors[0].y = BEACON0_Y;
  anchors[1].x = BEACON1_X; anchors[1].y = BEACON1_Y;
  anchors[2].x = BEACON2_X; anchors[2].y = BEACON2_Y;
  anchors[3].x = BEACON3_X; anchors[3].y = BEACON3_Y;
  for (int i = 0; i< NUM_ANCHORS; i++){
      anchors[i].kf = KF_DEFAULT_PARAMS[i];  // Set Kalman filter parameters
      anchors[i].pl = PL_DEFAULT_PARAMS[i];  // Set path-loss parameters
  }
  compute_beacon_dist();                     // Calculate inter-beacon distances
}


/**
 * @brief Main target tracking algorithm execution function.
 *        Performs the complete target tracking process in three main steps:
 *        1) Filter RSSI data using Kalman filters
 *        2) Calculate distances using path loss models
 *
 *        3) Compute target coordinates using trilateration
 */
void target_tracking(void) {

    // Step 1: Filter RSSI data from all beacons
    filter_rssi_data();  // Read RSSI data and update Kalman filters
//    printf("B1: %.2f |B2: %.2f |B3: %.2f |B4: %.2f\r\n",
//           anchor_filters[0].filtered_rssi, anchor_filters[1].filtered_rssi,
//           anchor_filters[2].filtered_rssi, anchor_filters[3].filtered_rssi);

    // Step 2: Calculate distances using path loss model
    for(int i = 0; i < NUM_ANCHORS; i++) {
        // Convert filtered RSSI to distance using path loss parameters
        anchor_pathloss[i].d_raw = rssi_to_dist(anchor_filters[i].filtered_rssi,
                                                anchors[i].pl.A, anchors[i].pl.m);
//        printf("D%d: %.2f\r\n",i+1,anchor_pathloss[i].d_raw);
    }
    
    // Step 3: Calculate coordinates from beacon combinations using trilateration
    compute_coordinate();
//    printf("Coordinate x: %.2f ,y: %.2f ,err: %.2f\r\n", final_coordinates.final_coordinate.x,
//                                                         final_coordinates.final_coordinate.y,
//                                                         final_coordinates.error_index);
    // Compute target position from anchor distances
}


// Hàm lấy tọa độ anchor
void get_anchor_position(float* b0_x, float* b0_y, float* b1_x, float* b1_y, float* b2_x, float* b2_y, float* b3_x, float* b3_y) {
  *b0_x = BEACON0_X;
  *b0_y = BEACON0_Y;
  *b1_x = BEACON1_X;
  *b1_y = BEACON1_Y;
  *b2_x = BEACON2_X;
  *b2_y = BEACON2_Y;
  *b3_x = BEACON3_X;
  *b3_y = BEACON3_Y;
}





















