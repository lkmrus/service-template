import { ConfigurableModuleBuilder } from '@nestjs/common';
import { BullmqAxiosConfig } from './bullmq-axios.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<BullmqAxiosConfig>().build();
