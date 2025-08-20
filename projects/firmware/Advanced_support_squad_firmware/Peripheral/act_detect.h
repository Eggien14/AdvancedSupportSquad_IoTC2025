#ifndef ACT_DETECT_H
#define ACT_DETECT_H

#define PIR_ON  1
#define PIR_OFF 0
#define LOAD_THRESHOLD 0
#define ACC_THRESHOLD 0
#define TILT_THRESHOLD 0

//DETECT DEFINE
#define NO_ACT 0
#define ADD 1
#define REMOVE 2
#define DROP 3
#define THROW 4
#define FALL 5
#define PUSH_HARD 6
#define TILT 7 //  NGHIENG

extern int detect_code;
void act_detect(void);

#endif // ACT_DETECT
/*
================================================================================
BEHAVIOR DETECTION BASED ON SENSOR STATES (LOADCELL, PIR, IMU)
--------------------------------------------------------------------------------
Legend:
- (1): Check LOADCELL (↑ Increase, ↓ Decrease, No = unchanged)
- (2): Check IMU (Tilted or High Acceleration)
- (3): Check PIR (Motion Yes/No)


--------------------------------------------------------------------------------
| LOADCELL | PIR |     IMU     | Action      | Description                     |
|----------|-----|-------------|-------------|---------------------------------|
| ↑ (1)    | Yes |             | ADD       1 | Item added normally             |
| ↑ (1)    | Yes |HighAccel(2) | THROW     2 | Item thrown in → Alert!         |
| ↓ (1)    | Yes |Not Tilted(2)| REMOVE    3 | Item removed normally           |
| ↓ (1)    | No  |Not Tilted(2)| DROP      4 | Item dropped unexpectedly       |
| ↓ (1)    | No  |Tilted(2)    | FALL      5 | Vehicle fall → Alert!           |
| No(1)    |     |HighAccel(2) | PUSH_HARD 6 | Sudden push or shaking → Alert! |
| No(1)    |     |Tilted(2)    | TILT      7 | Vehicle tilted → Alert!         |
--------------------------------------------------------------------------------

PRIORITY OF CHECKING:
----------------------
1. Check LOADCELL state (↑, ↓, No change)
2. Then check IMU:
   - Tilt → may be FALL or TILT
   - High acceleration → may be THROW or PUSH_HARD
3. Then check PIR:
   - Motion YES → usually indicates human interaction (ADD, THROW, REMOVE)
   - Motion NO  → usually unexpected (DROP, FALL)

ACTION OUTPUT:
---------------
- ADD, REMOVE, DROP, THROW, FALL: → streamCamera();
- THROW, FALL, PUSH_HARD, TILT:   → alert();
*/
