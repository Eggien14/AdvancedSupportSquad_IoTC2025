#ifndef LOADCELL_H
#define LOADCELL_H

#include "em_iadc.h"
#include "em_gpio.h"
#include "peripheral_handler.h"
#include "em_cmu.h"
#include "em_chip.h"

#define CLK_SRC_ADC_FREQ        20000000  // CLK_SRC_ADC
#define CLK_ADC_FREQ            10000000  // CLK_ADC - 10 MHz max in normal mode

#define loadcell_port gpioPortB
#define loadcell_pin 8

#define INPUT_BUS          BBUSALLOC
#define INPUT_BUSALLOC     GPIO_BBUSALLOC_BEVEN0_ADC0

void init_loadcell(void);
void read_loadcell(Loadcell_data *loadcell_data);



#endif // LOADCELL_H
