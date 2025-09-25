import { Module } from '@nestjs/common'
import { ImageProcessingService } from './image-processing.service'
import { ImagesController } from './images.controller'
import { ImagesRepository } from './images.repository'
import { ImagesService } from './images.service'

@Module({
	controllers: [ImagesController],
	providers: [ImagesService, ImageProcessingService, ImagesRepository],
})
export class ImagesModule {}
