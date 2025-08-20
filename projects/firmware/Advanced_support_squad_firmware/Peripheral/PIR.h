#ifndef PIR_H
#define PIR_H

#include "peripheral_handler.h"
#include "em_gpio.h"

#define PIR_port gpioPortB
#define PIR_pin 7

void init_PIR(void);
void read_PIR(PIR_data *pir_data);

#endif // PIR_H
