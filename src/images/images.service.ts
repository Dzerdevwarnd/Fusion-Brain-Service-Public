import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { FusionBrainService } from '../fusionbrain/fusionbrain.service'
import { MinioService } from '../minio/minio.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ImagesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly fusionBrain: FusionBrainService,
		private readonly minio: MinioService
	) {}

	private async getSharp() {
		const mod: any = await import('sharp')
		return mod.default || mod
	}

	async getStyles() {
		return this.fusionBrain.getValidStyles()
	}

	async checkAvailability() {
		return this.fusionBrain.checkAvailability()
	}

	async create(prompt: string, style: string) {
		/* 		const validStyles = await this.fusionBrain.getValidStyles()
		if (!validStyles.includes(style)) {
			throw new BadRequestException('Invalid style')
		} */
		const image = await this.prisma.image.create({ data: { prompt, style, status: 'PENDING' } })

		// Fire and forget async generation
		void this.generateAndStore(image.id, prompt, style)
		return { id: image.id, status: 'PENDING' }
	}

	private async generateAndStore(id: string, prompt: string, style: string) {
		try {
			await this.prisma.image.update({ where: { id }, data: { status: 'PROCESSING' } })
			const taskId = await this.fusionBrain.requestImage(prompt, style)
			const buffer = await this.fusionBrain.waitForResult(taskId)

			const sharp = await this.getSharp()
			// Determine mime by probing with sharp
			const sharpImg = sharp(buffer, { failOnError: false })
			const metadata = await sharpImg.metadata()
			const format = metadata.format || 'png'
			const originalKey = `${id}/original.${format}`

			// Create thumbnail webp 128x128
			const thumbnailBuffer = await sharp(buffer).resize(128, 128, { fit: 'cover' }).webp({ quality: 90 }).toBuffer()
			const thumbnailKey = `${id}/thumbnail.webp`

			await this.minio.putObject(originalKey, buffer, `image/${format}`)
			await this.minio.putObject(thumbnailKey, thumbnailBuffer, 'image/webp')

			await this.prisma.image.update({
				where: { id },
				data: { status: 'READY', originalKey, thumbnailKey },
			})
		} catch (err: any) {
			await this.prisma.image.update({
				where: { id },
				data: { status: 'FAILED', errorMessage: String(err?.message || err) },
			})
		}
	}

	async getFile(id: string, type: 'original' | 'thumbnail') {
		const image = await this.prisma.image.findUnique({ where: { id } })
		if (!image) throw new NotFoundException('Image not found')
		if (image.status !== 'READY') throw new BadRequestException('Image not ready')
		const key = type === 'original' ? image.originalKey : image.thumbnailKey
		if (!key) throw new NotFoundException('File not found')
		const stream = await this.minio.getObject(key)
		return { stream, filename: key.split('/').pop()! }
	}

	async list(page = 1, pageSize = 20) {
		page = Math.max(1, Math.floor(page))
		pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)))
		const [items, total] = await Promise.all([
			this.prisma.image.findMany({
				take: pageSize,
				skip: (page - 1) * pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.image.count(),
		])
		return {
			page,
			pageSize,
			total,
			items: items.map(i => ({
				id: i.id,
				status: i.status,
				prompt: i.prompt,
				style: i.style,
				thumbnailUrl: i.thumbnailKey ? this.minio.getObjectUrl(i.thumbnailKey) : null,
				originalUrl: i.originalKey ? this.minio.getObjectUrl(i.originalKey) : null,
				createdAt: i.createdAt,
			})),
		}
	}
}
