import { Global, Module } from '@nestjs/common'
import { FusionBrainService } from './fusionbrain.service'

@Global()
@Module({
	providers: [FusionBrainService],
	exports: [FusionBrainService],
})
export class FusionBrainModule {}
