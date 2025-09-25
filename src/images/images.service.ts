import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { FusionBrainService } from '../fusionbrain/fusionbrain.service'
import { MinioService } from '../minio/minio.service'
import { ImageProcessingService } from './image-processing.service'
import { ImagesRepository } from './images.repository'

@Injectable()
export class ImagesService {
	constructor(
		private readonly repo: ImagesRepository,
		private readonly fusionBrain: FusionBrainService,
		private readonly minio: MinioService,
		private readonly imageProcessing: ImageProcessingService
	) {}

	async create(prompt: string, style: string) {
		const image = await this.repo.createImage(prompt, style)

		// Fire and forget async generation
		void this.generateAndStore(image.id, prompt, style)
		return { id: image.id, status: 'PENDING' }
	}

	private async generateAndStore(id: string, prompt: string, style: string) {
		try {
			await this.repo.updateImage(id, { status: 'PROCESSING' })
			const taskId = await this.fusionBrain.requestImage(prompt, style)
			const buffer = await this.fusionBrain.waitForResult(taskId)

			// Determine format via processing service
			const format = await this.imageProcessing.detectOriginalFormat(buffer)
			const originalKey = `${id}/original.${format}`

			// Create thumbnail webp 128x128
			const thumbnailBuffer = await this.imageProcessing.makeThumbnailWebp(buffer, 128, 90)
			const thumbnailKey = `${id}/thumbnail.webp`

			await this.minio.putObject(originalKey, buffer, `image/${format}`)
			await this.minio.putObject(thumbnailKey, thumbnailBuffer, 'image/webp')

			await this.repo.updateImage(id, { status: 'READY', originalKey, thumbnailKey })
		} catch (err: any) {
			await this.repo.updateImage(id, { status: 'FAILED', errorMessage: String(err?.message || err) })
		}
	}

	async getFile(id: string, type: 'original' | 'thumbnail') {
		const image = await this.repo.findById(id)
		if (!image) throw new NotFoundException('Image not found')
		if (image.status === 'FAILED') {
			throw new BadRequestException(image.errorMessage || 'Image generation failed')
		}
		if (image.status !== 'READY') throw new BadRequestException(`Image not ready (status=${image.status})`)
		const key = type === 'original' ? image.originalKey : image.thumbnailKey
		if (!key) throw new NotFoundException('File not found')
		const stream = await this.minio.getObject(key)
		return { stream, filename: key.split('/').pop()! }
	}

	async list(page = 1, pageSize = 20) {
		page = Math.max(1, Math.floor(page))
		pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)))
		const [items, total] = await Promise.all([this.repo.findManyPaged(page, pageSize), this.repo.countAll()])
		return {
			page,
			pageSize,
			total,
			items: items.map(image => ({
				id: image.id,
				status: image.status,
				prompt: image.prompt,
				style: image.style,
				thumbnailUrl: image.thumbnailKey ? this.minio.getObjectUrl(image.thumbnailKey) : null,
				originalUrl: image.originalKey ? this.minio.getObjectUrl(image.originalKey) : null,
				createdAt: image.createdAt,
			})),
		}
	}
}
