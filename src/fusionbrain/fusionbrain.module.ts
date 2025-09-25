import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FusionBrainClient, HttpFusionBrainClient } from './fusionbrain.client'
import { FusionBrainService } from './fusionbrain.service'

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: 'FUSION_CLIENT',
			useFactory: (config: ConfigService): FusionBrainClient =>
				new HttpFusionBrainClient({
					apiKey: config.get<string>('FUSION_BRAIN_API_KEY'),
					secretKey: config.get<string>('FUSION_BRAIN_API_SECRET'),
					baseUrl: config.get<string>('FUSION_BRAIN_API_URL') || 'https://api-key.fusionbrain.ai/',
				}),
			inject: [ConfigService],
		},
		FusionBrainService,
	],
	exports: [FusionBrainService],
})
export class FusionBrainModule {}
