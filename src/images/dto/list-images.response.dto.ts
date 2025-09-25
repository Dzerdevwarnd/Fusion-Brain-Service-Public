import { ApiProperty } from '@nestjs/swagger'

export class ImageListItemDto {
	@ApiProperty({ example: 'uuid' })
	id!: string

	@ApiProperty({ enum: ['PENDING', 'PROCESSING', 'READY', 'FAILED'] })
	status!: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'

	@ApiProperty()
	prompt!: string

	@ApiProperty()
	style!: string

	@ApiProperty({ nullable: true, example: 'http://.../thumbnail.webp' })
	thumbnailUrl!: string | null

	@ApiProperty({ nullable: true, example: 'http://.../original.png' })
	originalUrl!: string | null

	@ApiProperty({ type: String, format: 'date-time' })
	createdAt!: Date | string
}

export class ListImagesResponseDto {
	@ApiProperty({ example: 1 })
	page!: number

	@ApiProperty({ example: 20 })
	pageSize!: number

	@ApiProperty({ example: 1 })
	total!: number

	@ApiProperty({ type: [ImageListItemDto] })
	items!: ImageListItemDto[]
}
