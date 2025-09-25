import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ImagesRepository {
	constructor(private readonly prisma: PrismaService) {}

	async createImage(prompt: string, style: string) {
		return this.prisma.image.create({ data: { prompt, style, status: 'PENDING' } })
	}

	async updateImage(
		id: string,
		data: Partial<{
			status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
			originalKey: string | null
			thumbnailKey: string | null
			errorMessage: string | null
		}>
	) {
		return this.prisma.image.update({ where: { id }, data })
	}

	async findById(id: string) {
		return this.prisma.image.findUnique({ where: { id } })
	}

	async findManyPaged(page: number, pageSize: number) {
		return this.prisma.image.findMany({
			where: { status: 'READY' },
			take: pageSize,
			skip: (page - 1) * pageSize,
			orderBy: { createdAt: 'desc' },
		})
	}

	async countAll() {
		return this.prisma.image.count({ where: { status: 'READY' } })
	}
}
