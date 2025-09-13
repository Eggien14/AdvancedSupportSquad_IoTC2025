#include "loadcell.h"

void init_loadcell(void){
  CHIP_Init();
  IADC_Init_t init = IADC_INIT_DEFAULT;
  IADC_AllConfigs_t initAllConfigs = IADC_ALLCONFIGS_DEFAULT;
  IADC_InitSingle_t initSingle = IADC_INITSINGLE_DEFAULT;
  // Single input structure
  IADC_SingleInput_t singleInput;

  /*
   * Enable IADC0 and GPIO register clock.
   *
   * Note: On EFR32xG21 devices, CMU_ClockEnable() calls have no effect
   * as clocks are enabled/disabled on-demand in response to peripheral
   * requests.  Deleting such lines is safe on xG21 devices and will
   * reduce provide a small reduction in code size.
   */
  CMU_ClockEnable(cmuClock_IADC0, true);
  CMU_ClockEnable(cmuClock_GPIO, true);

  // Use the FSRC0 as the IADC clock so it can run in EM2
  CMU_ClockSelectSet(cmuClock_IADCCLK, cmuSelect_FSRCO);

  // Set the prescaler needed for the intended IADC clock frequency
  init.srcClkPrescale = IADC_calcSrcClkPrescale(IADC0, CLK_SRC_ADC_FREQ, 0);

  // Shutdown between conversions to reduce current
  init.warmup = iadcWarmupKeepWarm;

  /*
   * Configuration 0 is used by both scan and single conversions by
   * default.  Use internal bandgap as the reference and specify the
   * reference voltage in mV.
   *
   * Resolution is not configurable directly but is based on the
   * selected oversampling ratio (osrHighSpeed), which defaults to
   * 2x and generates 12-bit results.
   */
  initAllConfigs.configs[0].reference = iadcCfgReferenceVddx;
  initAllConfigs.configs[0].vRef = 3300;
  initAllConfigs.configs[0].osrHighSpeed = iadcCfgOsrHighSpeed2x;
  initAllConfigs.configs[0].analogGain = iadcCfgAnalogGain1x;

  /*
   * CLK_SRC_ADC must be prescaled by some value greater than 1 to
   * derive the intended CLK_ADC frequency.
   *
   * Based on the default 2x oversampling rate (OSRHS)...
   *
   * conversion time = ((4 * OSRHS) + 2) / fCLK_ADC
   *
   * ...which results in a maximum sampling rate of 833 ksps with the
   * 2-clock input multiplexer switching time is included.
   */
  initAllConfigs.configs[0].adcClkPrescale = IADC_calcAdcClkPrescale(IADC0,
                                                                     CLK_ADC_FREQ,
                                                                     0,
                                                                     iadcCfgModeNormal,
                                                                     init.srcClkPrescale);

  /*
   * Specify the input channel.  When negInput = iadcNegInputGnd, the
   * conversion is single-ended.
   */
  singleInput.posInput   = IADC_portPinToPosInput(loadcell_port,loadcell_pin);
  singleInput.negInput   = iadcNegInputGnd;
  singleInput.configId   = 0;
  singleInput.compare    = false;

  // Allocate the analog bus for ADC0 inputs
  GPIO->INPUT_BUS |= INPUT_BUSALLOC;

  // Initialize IADC
      IADC_init(IADC0, &init, &initAllConfigs);

      // Initialize a single-channel conversion
      IADC_initSingle(IADC0, &initSingle, &singleInput);

}
void read_loadcell(Loadcell_data *loadcell_data){
  IADC_Result_t sample;
  IADC_command(IADC0, iadcCmdStartSingle);
  sample = IADC_pullSingleFifoResult(IADC0);
  *loadcell_data = sample.data*3.3/4095 ;
}
