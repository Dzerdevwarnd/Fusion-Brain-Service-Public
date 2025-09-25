import { Body, Controller, Get, Param, Post, Query, Res, StreamableFile } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { CreateImageDto } from './dto/create-image.dto'
import { CreateImageResponseDto } from './dto/create-image.response.dto'
import { GetFileDto } from './dto/get-file.dto'
import { ListImagesResponseDto } from './dto/list-images.response.dto'
import { ImagesService } from './images.service'

@ApiTags('images')
@Controller('images')
export class ImagesController {
	constructor(private readonly imagesService: ImagesService) {}

	@Post()
	@ApiOperation({ summary: 'Create image generation task' })
	@ApiCreatedResponse({ description: 'Task created', type: CreateImageResponseDto })
	@ApiBadRequestResponse({ description: 'Validation error' })
	async create(@Body() dto: CreateImageDto) {
		return this.imagesService.create(dto.prompt, dto.style)
	}

	@Get(':id/file')
	@ApiOperation({ summary: 'Get generated image file' })
	@ApiQuery({ name: 'type', enum: ['original', 'thumbnail'], required: true })
	@ApiOkResponse({
		description: 'Image file stream (binary)',
		content: {
			'application/octet-stream': {
				schema: { type: 'string', format: 'binary' },
			},
		},
	})
	@ApiBadRequestResponse({ description: 'Image not ready or generation failed' })
	@ApiNotFoundResponse({ description: 'Image or file not found' })
	async getFile(@Param('id') id: string, @Query() query: GetFileDto, @Res({ passthrough: true }) res: Response) {
		const { stream, filename } = await this.imagesService.getFile(id, query.type)
		res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
		return new StreamableFile(stream)
	}

	@Get('thumbnails')
	@ApiOperation({ summary: 'List images with thumbnail and original URLs' })
	@ApiOkResponse({ description: 'List of images with pagination', type: ListImagesResponseDto })
	async list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
		return this.imagesService.list(Number(page) || 1, Number(pageSize) || 20)
	}
}
