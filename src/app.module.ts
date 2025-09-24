import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FusionBrainModule } from './fusionbrain/fusionbrain.module';
import { ImagesModule } from './images/images.module';
import { MinioModule } from './minio/minio.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		MinioModule,
		FusionBrainModule,
		ImagesModule,
	],
})
export class AppModule {}
