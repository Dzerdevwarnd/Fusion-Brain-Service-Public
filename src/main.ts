import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true })
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

	const config = new DocumentBuilder()
		.setTitle('FusionBrain Image Service')
		.setDescription('API for async image generation and storage')
		.setVersion('0.2.0')
		.addServer('/')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document, {
		customSiteTitle: 'FusionBrain Image Service API',
		explorer: true,
		swaggerOptions: {
			persistAuthorization: true,
		},
	})

	await app.listen(process.env.PORT || 3000)
}

bootstrap()
