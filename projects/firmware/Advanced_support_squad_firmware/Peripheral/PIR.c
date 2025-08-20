#include "PIR.h"
void init_PIR(void){
  GPIO_PinModeSet(PIR_port,PIR_pin,gpioModeInputPull,0);
}
void read_PIR(PIR_data *pir_data){
  *pir_data = GPIO_PinInGet(PIR_port,PIR_pin);
}
