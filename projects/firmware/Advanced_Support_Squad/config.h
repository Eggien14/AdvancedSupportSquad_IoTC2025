#ifndef CONFIG_H
#define CONFIG_H



#include <stdio.h>
#include <string.h>
#include <stddef.h>
#include <stdint.h>
#include <math.h>


/******************************************************************************************//**
 *
 * Target tracking variable and data structure define
 *
 *********************************************************************************************/


/*****************************VARIABLE DEFINE*********************************/

// Số lượng beacon (anchors) và số tổ hợp cho trilateration
#define NUM_ANCHORS      4

#define NUM_COMBINATIONS 4

// Định nghĩa MAC address của từng beacon
static const uint8_t BEACON_MACS[NUM_ANCHORS][6] = {
    { 0xDA, 0x7E, 0x67, 0x18, 0x2E, 0xC8 },  // Beacon 0
    { 0x7E, 0x7A, 0xAD, 0xDA, 0xF3, 0x80 },  // Beacon 1
    { 0x16, 0x07, 0x62, 0xDA, 0xF3, 0x80 },  // Beacon 2
    { 0x4A, 0xC9, 0x62, 0xDA, 0xF3, 0x80 }   // Beacon 3
};

//Tọa độ cố định của 4 beacon trong hệ tọa độ Cartesian (m)
#define BEACON0_X  0.0
#define BEACON0_Y  0.0

#define BEACON1_X  0.0
#define BEACON1_Y  10.0

#define BEACON2_X  3.6
#define BEACON2_Y  10.0

#define BEACON3_X  3.6
#define BEACON3_Y  0.0

#define NORTH_BORDER  10.0
#define EAST_BORDER   3.6
#define WEST_BORDER   0.0
#define SOUTH_BORDER  0.0

#define TRILATERATION_ERROR_ALLOW 2.0


/***************************DATA-STRUCTURE DEFINE*****************************/

// Đọc RSSI của beacon
typedef struct {
    uint8_t mac_beacon[6];  ///< MAC address của beacon
    double  raw_rssi;       ///< RSSI thô vừa đọc được (dBm)
} AnchorReading_t;




/******************************************************************************************//**
 *
 * Global variable define
 *
 *********************************************************************************************/

extern AnchorReading_t anchor_readings[NUM_ANCHORS];



#endif // CONFIG_H

